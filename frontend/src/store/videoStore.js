import { create } from 'zustand';
import VideoSyncWorkerManager from '../utils/VideoSyncWorkerManager';

const useVideoStore = create((set, get) => ({
  // State
  currentVideo: null,
  isPlaying: false,
  isPaused: true,
  currentTime: 0,
  duration: 0,
  volume: 0.5,
  isLoading: false,
  isMuted: false,
  playbackRate: 1,
  quality: 'auto',
  buffered: 0,
  error: null,

  // Video history
  videoHistory: [],
  playlist: [],
  currentIndex: 0,

  // Sync data
  lastSyncTime: 0,
  syncDrift: 0,
  isHost: false,

  // WebWorker for performance optimization
  syncWorkerManager: null,
  workerInitialized: false,

  // Drift correction data
  latencyHistory: [], // Array to store latency measurements
  driftHistory: [], // Array to store drift measurements
  lastPingTime: 0,
  averageLatency: 0,
  driftCorrectionActive: false,
  targetSyncTime: 0,
  adjustmentRate: 0.02, // Linear adjustment rate (2% per frame)
  maxDriftTolerance: 1.0, // Maximum drift before correction (1 second)
  minDriftTolerance: 0.1, // Minimum drift to trigger correction (100ms)
  
  // Triangular latency ring buffer (for 5 measurements)
  latencyRingBuffer: {
    buffer: new Array(5).fill(0),
    index: 0,
    size: 0
  },

  // Actions
  // Initialize WebWorker for performance optimization
  initializeWorker: async (config = {}) => {
    try {
      if (get().syncWorkerManager) {
        return true; // Already initialized
      }

      const workerManager = new VideoSyncWorkerManager();
      await workerManager.init({
        maxCorrection: 500,
        syncThreshold: 100,
        latencyWeight: 0.7,
        driftWeight: 0.3,
        ...config
      });

      // Setup event listeners for worker
      workerManager.on('LATENCY_CALCULATED', (data) => {
        const state = get();
        set({
          averageLatency: data.stats.average,
          latencyHistory: [...state.latencyHistory, {
            timestamp: Date.now(),
            latency: data.networkLatency,
            roundTripTime: data.roundTripTime
          }].slice(-10) // Keep last 10 measurements
        });
      });

      workerManager.on('DRIFT_CALCULATED', (data) => {
        const state = get();
        set({
          syncDrift: data.adjustedDrift,
          driftHistory: [...state.driftHistory, {
            timestamp: Date.now(),
            drift: data.adjustedDrift,
            rawDrift: data.rawDrift
          }].slice(-10) // Keep last 10 measurements
        });
      });

      workerManager.on('ADJUSTMENT_CALCULATED', (data) => {
        set({
          targetSyncTime: data.newPosition,
          adjustmentRate: Math.abs(data.correction) > 0.1 ? 0.05 : 0.02
        });
      });

      workerManager.on('error', (error) => {
        console.error('VideoSync Worker Error:', error);
        set({ error: error.message });
      });

      set({
        syncWorkerManager: workerManager,
        workerInitialized: true
      });

      console.log('VideoSync Worker initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize VideoSync Worker:', error);
      set({ error: `Worker initialization failed: ${error.message}` });
      return false;
    }
  },

  // Destroy WebWorker
  destroyWorker: () => {
    const workerManager = get().syncWorkerManager;
    if (workerManager) {
      workerManager.destroy();
      set({
        syncWorkerManager: null,
        workerInitialized: false
      });
    }
  },
  loadVideo: async (videoUrl, metadata = {}) => {
    set({ isLoading: true, error: null });

    try {
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Extract video metadata from URL
      const videoData = {
        id: Date.now().toString(),
        url: videoUrl,
        title: metadata.title || extractTitleFromUrl(videoUrl),
        thumbnail: metadata.thumbnail || generateThumbnail(videoUrl),
        duration: metadata.duration || 0,
        type: getVideoType(videoUrl),
        source: getVideoSource(videoUrl),
        loadedAt: new Date().toISOString()
      };

      set(state => ({
        currentVideo: videoData,
        isLoading: false,
        currentTime: 0,
        isPlaying: false,
        isPaused: true,
        videoHistory: [videoData, ...state.videoHistory.slice(0, 9)] // Keep last 10
      }));

      return { success: true, video: videoData };
    } catch (error) {
      set({
        isLoading: false,
        error: error.message
      });
      return { success: false, error: error.message };
    }
  },

  playVideo: () => {
    set({
      isPlaying: true,
      isPaused: false,
      lastSyncTime: Date.now()
    });
  },

  pauseVideo: () => {
    set({
      isPlaying: false,
      isPaused: true,
      lastSyncTime: Date.now()
    });
  },

  seekVideo: (time) => {
    set({
      currentTime: time,
      lastSyncTime: Date.now()
    });
  },

  setVolume: (volume) => {
    set({
      volume: Math.max(0, Math.min(1, volume)),
      isMuted: volume === 0
    });
  },

  toggleMute: () => {
    set(state => ({
      isMuted: !state.isMuted
    }));
  },

  setPlaybackRate: (rate) => {
    set({
      playbackRate: rate
    });
  },

  setQuality: (quality) => {
    set({
      quality
    });
  },

  updateCurrentTime: (time) => {
    set({
      currentTime: time
    });
  },

  setDuration: (duration) => {
    set({
      duration
    });
  },

  setBuffered: (buffered) => {
    set({
      buffered
    });
  },

  // Sync functions
  syncWithTime: (serverTime, serverPlaying) => {
    const { currentTime, isPlaying } = get();
    const drift = Math.abs(currentTime - serverTime);
    
    if (drift > 2) { // 2 second tolerance
      set({
        currentTime: serverTime,
        syncDrift: drift,
        isPlaying: serverPlaying,
        isPaused: !serverPlaying,
        lastSyncTime: Date.now()
      });
      return true; // Sync was needed
    }
    
    return false; // Already in sync
  },

  // Advanced drift correction functions
  measureLatency: async (socketStore) => {
    const startTime = performance.now();
    const pingId = Date.now();
    
    try {
      // Send ping to server
      await new Promise((resolve) => {
        socketStore.socket?.emit('ping', { id: pingId, timestamp: startTime });
        
        const handlePong = (data) => {
          if (data.id === pingId) {
            const latency = (performance.now() - startTime) / 2; // Round trip / 2
            get().updateLatencyHistory(latency);
            socketStore.socket?.off('pong', handlePong);
            resolve();
          }
        };
        
        socketStore.socket?.on('pong', handlePong);
        
        // Timeout after 5 seconds
        setTimeout(() => {
          socketStore.socket?.off('pong', handlePong);
          resolve();
        }, 5000);
      });
    } catch (error) {
      console.warn('Failed to measure latency:', error);
    }
  },

  // Triangular method latency measurement dengan WebWorker
  measureTriangularLatency: async (socketStore) => {
    const t1 = performance.now(); // Client timestamp
    const pingId = Date.now();
    
    try {
      const result = await new Promise((resolve, reject) => {
        // Send t1 to server
        socketStore.socket?.emit('triangular-ping', { 
          id: pingId, 
          t1: t1 
        });
        
        const handleTriangularPong = async (data) => {
          if (data.id === pingId) {
            const t3 = performance.now(); // Time when response received
            
            // Validate data
            if (isNaN(data.t1) || isNaN(data.t2) || isNaN(t3)) {
              console.warn('Invalid triangular latency data - NaN values detected');
              socketStore.socket?.off('triangular-pong', handleTriangularPong);
              reject(new Error('Invalid latency data'));
              return;
            }
            
            socketStore.socket?.off('triangular-pong', handleTriangularPong);
            
            // Use WebWorker if available, fallback to main thread
            const workerManager = get().syncWorkerManager;
            if (workerManager && workerManager.isReady()) {
              try {
                // Calculate using WebWorker
                const workerResult = await workerManager.calculateLatency(
                  data.t1, // pingTime
                  data.t2, // serverTime
                  t3       // pongTime
                );
                
                resolve({
                  latency: workerResult.networkLatency,
                  serverTime: data.t2,
                  roundTripTime: workerResult.roundTripTime,
                  usingWorker: true,
                  stats: workerResult.stats
                });
              } catch (workerError) {
                console.warn('WebWorker calculation failed, using fallback:', workerError);
                // Fallback to main thread calculation
                const latency = (t3 - data.t1) / 2;
                get().updateLatencyRingBuffer(latency);
                resolve({
                  latency: latency,
                  serverTime: data.t2,
                  roundTripTime: t3 - data.t1,
                  usingWorker: false
                });
              }
            } else {
              // Fallback to main thread calculation
              const latency = (t3 - data.t1) / 2;
              get().updateLatencyRingBuffer(latency);
              resolve({
                latency: latency,
                serverTime: data.t2,
                roundTripTime: t3 - data.t1,
                usingWorker: false
              });
            }
          }
        };
        
        socketStore.socket?.on('triangular-pong', handleTriangularPong);
        
        // Timeout after 5 seconds
        setTimeout(() => {
          socketStore.socket?.off('triangular-pong', handleTriangularPong);
          reject(new Error('Triangular latency measurement timeout'));
        }, 5000);
      });
      
      return result;
    } catch (error) {
      console.warn('Failed to measure triangular latency:', error);
      throw error;
    }
  },

  // Update latency ring buffer (keeps last 5 measurements)
  updateLatencyRingBuffer: (latency) => {
    set(state => {
      const buffer = state.latencyRingBuffer;
      
      // Add to ring buffer
      buffer.buffer[buffer.index] = latency;
      buffer.index = (buffer.index + 1) % 5;
      buffer.size = Math.min(buffer.size + 1, 5);
      
      // Calculate average from ring buffer
      const validMeasurements = buffer.buffer.slice(0, buffer.size);
      const averageLatency = validMeasurements.reduce((sum, l) => sum + l, 0) / buffer.size;
      
      return {
        latencyRingBuffer: { ...buffer },
        averageLatency,
        lastPingTime: Date.now()
      };
    });
  },

  // Main synchronization function with playback adjustment
  adjustPlayback: (video) => {
    const state = get();
    
    try {
      // Validate video element
      if (!video || typeof video.currentTime !== 'number' || isNaN(video.currentTime)) {
        throw new Error('Invalid video element or currentTime is NaN');
      }
      
      const currentPosition = video.currentTime;
      const playbackRate = video.playbackRate || 1;
      const latency = state.averageLatency / 1000; // Convert to seconds
      
      // Validate values
      if (isNaN(currentPosition) || isNaN(playbackRate) || isNaN(latency)) {
        throw new Error('NaN values detected in playback adjustment');
      }
      
      // Calculate adjustment using formula: newPosition = currentPosition + (latency * playbackRate)
      let adjustment = latency * playbackRate;
      
      // Apply 500ms maximum correction threshold
      const maxCorrectionSeconds = 0.5;
      adjustment = Math.min(Math.abs(adjustment), maxCorrectionSeconds) * Math.sign(adjustment);
      
      const adjustedPosition = currentPosition + adjustment;
      
      // Validate adjusted position
      if (isNaN(adjustedPosition) || adjustedPosition < 0) {
        throw new Error('Invalid adjusted position calculated');
      }
      
      // Apply adjustment if significant enough (> 50ms)
      if (Math.abs(adjustment) > 0.05) {
        video.currentTime = adjustedPosition;
        
        // Update store
        set({
          currentTime: adjustedPosition,
          lastSyncTime: Date.now()
        });
      }
      
      return {
        adjustedPosition: adjustedPosition,
        latency: latency * 1000, // Return in milliseconds
        correction: adjustment * 1000,
        applied: Math.abs(adjustment) > 0.05
      };
      
    } catch (error) {
      console.error('Playback adjustment error:', error);
      return {
        adjustedPosition: video?.currentTime || 0,
        latency: 0,
        correction: 0,
        applied: false,
        error: error.message
      };
    }
  },

  updateLatencyHistory: (latency) => {
    set(state => {
      const newHistory = [...state.latencyHistory, latency].slice(-10); // Keep last 10 measurements
      const averageLatency = newHistory.reduce((sum, l) => sum + l, 0) / newHistory.length;
      
      return {
        latencyHistory: newHistory,
        averageLatency,
        lastPingTime: Date.now()
      };
    });
  },

  calculateDrift: (serverTime, clientTime, latency = 0) => {
    // Compensate for network latency
    const compensatedServerTime = serverTime + (latency / 1000);
    const drift = clientTime - compensatedServerTime;
    
    set(state => {
      const newDriftHistory = [...state.driftHistory, drift].slice(-20); // Keep last 20 measurements
      return {
        driftHistory: newDriftHistory,
        syncDrift: drift
      };
    });
    
    return drift;
  },

  startDriftCorrection: (targetTime, currentTime) => {
    const { adjustmentRate, minDriftTolerance } = get();
    const drift = Math.abs(targetTime - currentTime);
    
    if (drift < minDriftTolerance) {
      return false; // Drift too small, no correction needed
    }
    
    set({
      driftCorrectionActive: true,
      targetSyncTime: targetTime,
      lastSyncTime: Date.now()
    });
    
    return true;
  },

  applyLinearAdjustment: () => {
    const state = get();
    if (!state.driftCorrectionActive) return;
    
    const { 
      currentTime, 
      targetSyncTime, 
      adjustmentRate, 
      minDriftTolerance,
      isPlaying 
    } = state;
    
    const drift = targetSyncTime - currentTime;
    
    // Stop correction if drift is within tolerance
    if (Math.abs(drift) < minDriftTolerance) {
      set({
        driftCorrectionActive: false,
        targetSyncTime: 0
      });
      return;
    }
    
    // Calculate adjustment amount
    const adjustmentDirection = drift > 0 ? 1 : -1;
    const adjustmentAmount = Math.min(
      Math.abs(drift), 
      adjustmentRate
    ) * adjustmentDirection;
    
    // Apply gradual adjustment
    const newTime = currentTime + adjustmentAmount;
    
    set({
      currentTime: newTime,
      lastSyncTime: Date.now()
    });
    
    // Log adjustment for debugging
    if (Math.abs(drift) > 0.5) {
      console.log(`Drift correction: ${drift.toFixed(3)}s, adjusting by ${adjustmentAmount.toFixed(3)}s`);
    }
  },

  smartSync: (serverTime, serverPlaying, latency = null) => {
    const state = get();
    const { averageLatency, maxDriftTolerance, isPlaying } = state;
    
    // Use provided latency or average latency
    const effectiveLatency = latency !== null ? latency : averageLatency;
    
    // Calculate drift with latency compensation
    const drift = get().calculateDrift(serverTime, state.currentTime, effectiveLatency);
    const absDrift = Math.abs(drift);
    
    // Immediate sync for large drifts
    if (absDrift > maxDriftTolerance) {
      console.log(`Large drift detected (${drift.toFixed(3)}s), performing immediate sync`);
      set({
        currentTime: serverTime,
        isPlaying: serverPlaying,
        isPaused: !serverPlaying,
        driftCorrectionActive: false,
        lastSyncTime: Date.now()
      });
      return { type: 'immediate', drift: absDrift };
    }
    
    // Gradual correction for smaller drifts
    if (absDrift > state.minDriftTolerance) {
      const correctionStarted = get().startDriftCorrection(serverTime, state.currentTime);
      if (correctionStarted) {
        console.log(`Starting gradual drift correction for ${drift.toFixed(3)}s drift`);
        return { type: 'gradual', drift: absDrift };
      }
    }
    
    // Update playing state if different
    if (isPlaying !== serverPlaying) {
      set({
        isPlaying: serverPlaying,
        isPaused: !serverPlaying,
        lastSyncTime: Date.now()
      });
      return { type: 'playstate', drift: absDrift };
    }
    
    return { type: 'none', drift: absDrift };
  },

  getDriftStatistics: () => {
    const { driftHistory, latencyHistory, averageLatency } = get();
    
    if (driftHistory.length === 0) {
      return {
        averageDrift: 0,
        maxDrift: 0,
        driftStability: 1,
        averageLatency,
        samples: 0
      };
    }
    
    const averageDrift = driftHistory.reduce((sum, d) => sum + Math.abs(d), 0) / driftHistory.length;
    const maxDrift = Math.max(...driftHistory.map(Math.abs));
    
    // Calculate drift stability (lower is more stable)
    const driftVariance = driftHistory.reduce((sum, d) => {
      return sum + Math.pow(Math.abs(d) - averageDrift, 2);
    }, 0) / driftHistory.length;
    const driftStability = 1 / (1 + driftVariance);
    
    return {
      averageDrift,
      maxDrift,
      driftStability,
      averageLatency,
      samples: driftHistory.length
    };
  },

  resetDriftCorrection: () => {
    set({
      latencyHistory: [],
      driftHistory: [],
      driftCorrectionActive: false,
      targetSyncTime: 0,
      averageLatency: 0,
      syncDrift: 0
    });
  },

  // Playlist management
  addToPlaylist: (video) => {
    set(state => ({
      playlist: [...state.playlist, video]
    }));
  },

  removeFromPlaylist: (videoId) => {
    set(state => ({
      playlist: state.playlist.filter(v => v.id !== videoId)
    }));
  },

  playNext: () => {
    const { playlist, currentIndex } = get();
    if (currentIndex < playlist.length - 1) {
      const nextVideo = playlist[currentIndex + 1];
      set({
        currentVideo: nextVideo,
        currentIndex: currentIndex + 1,
        currentTime: 0
      });
      return nextVideo;
    }
    return null;
  },

  playPrevious: () => {
    const { playlist, currentIndex } = get();
    if (currentIndex > 0) {
      const prevVideo = playlist[currentIndex - 1];
      set({
        currentVideo: prevVideo,
        currentIndex: currentIndex - 1,
        currentTime: 0
      });
      return prevVideo;
    }
    return null;
  },

  // Utility functions
  clearError: () => {
    set({ error: null });
  },

  resetVideo: () => {
    set({
      currentVideo: null,
      isPlaying: false,
      isPaused: true,
      currentTime: 0,
      duration: 0,
      error: null
    });
  },

  // Screen sharing
  startScreenShare: async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: 'screen' },
        audio: true
      });

      const screenVideo = {
        id: 'screen-' + Date.now(),
        url: URL.createObjectURL(stream),
        title: 'Screen Share',
        type: 'screen-share',
        source: 'local',
        stream: stream,
        loadedAt: new Date().toISOString()
      };

      set({
        currentVideo: screenVideo,
        isPlaying: true,
        isPaused: false
      });

      return { success: true, video: screenVideo };
    } catch (error) {
      set({ error: 'Screen sharing not supported or permission denied' });
      return { success: false, error: error.message };
    }
  },

  stopScreenShare: () => {
    const { currentVideo } = get();
    if (currentVideo?.stream) {
      currentVideo.stream.getTracks().forEach(track => track.stop());
    }
    set({
      currentVideo: null,
      isPlaying: false,
      isPaused: true
    });
  },

  // WebWorker-enhanced methods
  calculateDriftWithWorker: async (expectedTime, actualTime, playbackRate = 1) => {
    const workerManager = get().syncWorkerManager;
    
    if (workerManager && workerManager.isReady()) {
      try {
        const result = await workerManager.calculateDrift(expectedTime, actualTime, playbackRate);
        return result;
      } catch (error) {
        console.warn('WebWorker drift calculation failed, using fallback:', error);
        // Fallback to main thread
        return get().calculateDrift(expectedTime, actualTime, playbackRate);
      }
    } else {
      // Fallback to main thread
      return get().calculateDrift(expectedTime, actualTime, playbackRate);
    }
  },

  calculateAdjustmentWithWorker: async (currentTime, targetTime, latency, playbackRate = 1) => {
    const workerManager = get().syncWorkerManager;
    
    if (workerManager && workerManager.isReady()) {
      try {
        const result = await workerManager.calculateAdjustment(currentTime, targetTime, latency, playbackRate);
        return result;
      } catch (error) {
        console.warn('WebWorker adjustment calculation failed, using fallback:', error);
        // Fallback to main thread calculation
        return {
          currentTime,
          targetTime,
          timeDiff: targetTime - currentTime,
          correction: (targetTime - currentTime) + (latency * playbackRate),
          newPosition: Math.max(0, currentTime + (targetTime - currentTime) + (latency * playbackRate)),
          adjustmentMethod: Math.abs(targetTime - currentTime) > 0.5 ? 'seek' : 'rate_adjust',
          confidence: 0.5,
          usingWorker: false
        };
      }
    } else {
      // Fallback calculation
      const timeDiff = targetTime - currentTime;
      const correction = timeDiff + (latency * playbackRate);
      return {
        currentTime,
        targetTime,
        timeDiff,
        correction,
        newPosition: Math.max(0, currentTime + correction),
        adjustmentMethod: Math.abs(correction) > 0.5 ? 'seek' : 'rate_adjust',
        confidence: 0.5,
        usingWorker: false
      };
    }
  },

  performFullSyncWithWorker: async (syncData) => {
    const workerManager = get().syncWorkerManager;
    
    if (workerManager && workerManager.isReady()) {
      try {
        const result = await workerManager.performFullSync(syncData);
        
        // Update store with results
        if (result.latency) {
          set(state => ({
            averageLatency: result.latency.stats?.average || state.averageLatency,
            latencyHistory: [...state.latencyHistory, {
              timestamp: Date.now(),
              latency: result.latency.networkLatency,
              roundTripTime: result.latency.roundTripTime
            }].slice(-10)
          }));
        }
        
        if (result.drift) {
          set(state => ({
            syncDrift: result.drift.adjustedDrift,
            driftHistory: [...state.driftHistory, {
              timestamp: Date.now(),
              drift: result.drift.adjustedDrift,
              rawDrift: result.drift.rawDrift
            }].slice(-10)
          }));
        }
        
        if (result.adjustment) {
          set({
            targetSyncTime: result.adjustment.newPosition,
            adjustmentRate: Math.abs(result.adjustment.correction) > 0.1 ? 0.05 : 0.02
          });
        }
        
        return {
          ...result,
          usingWorker: true
        };
      } catch (error) {
        console.warn('WebWorker full sync failed, using fallback:', error);
        // Fallback to sequential calculations
        return await get().performFallbackSync(syncData);
      }
    } else {
      // Fallback to sequential calculations
      return await get().performFallbackSync(syncData);
    }
  },

  performFallbackSync: async (syncData) => {
    const { currentTime, targetTime, playbackRate = 1 } = syncData;
    
    // Sequential fallback calculations
    const drift = get().calculateDrift(targetTime, currentTime, playbackRate || 0);
    const adjustment = {
      currentTime,
      targetTime,
      timeDiff: targetTime - currentTime,
      correction: targetTime - currentTime,
      newPosition: Math.max(0, targetTime),
      adjustmentMethod: Math.abs(targetTime - currentTime) > 0.5 ? 'seek' : 'rate_adjust',
      confidence: 0.3,
      usingWorker: false
    };
    
    return {
      drift: { adjustedDrift: drift, rawDrift: drift },
      adjustment,
      timestamp: Date.now(),
      usingWorker: false
    };
  },

  getWorkerStats: async () => {
    const workerManager = get().syncWorkerManager;
    
    if (workerManager && workerManager.isReady()) {
      try {
        const stats = await workerManager.getStats();
        return {
          ...stats,
          available: true
        };
      } catch (error) {
        console.warn('Failed to get worker stats:', error);
        return { available: false, error: error.message };
      }
    }
    
    return { available: false, reason: 'Worker not initialized' };
  }
}));

// Helper functions
function extractTitleFromUrl(url) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = pathname.split('/').pop();
    return filename.split('.')[0] || 'Untitled Video';
  } catch {
    return 'Untitled Video';
  }
}

function generateThumbnail(url) {
  // For demo purposes, return a placeholder
  return `https://via.placeholder.com/320x180/1f2937/ffffff?text=Video`;
}

function getVideoType(url) {
  const extension = url.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'mp4':
      return 'video/mp4';
    case 'webm':
      return 'video/webm';
    case 'ogg':
      return 'video/ogg';
    default:
      return 'video/mp4';
  }
}

function getVideoSource(url) {
  if (url.includes('drive.google.com')) return 'google-drive';
  if (url.includes('dropbox.com')) return 'dropbox';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('vimeo.com')) return 'vimeo';
  return 'direct';
}

export default useVideoStore;
