/**
 * Video Sync WebWorker
 * Menghitung video drift, network latency, dan playback adjustment
 * tanpa blocking main thread
 */

class VideoSyncWorker {
  constructor() {
    this.latencyHistory = [];
    this.driftHistory = [];
    this.maxHistorySize = 10;
    this.isRunning = false;
    this.config = {
      maxCorrection: 500, // ms
      syncThreshold: 100, // ms
      latencyWeight: 0.7,
      driftWeight: 0.3
    };
  }

  // Initialize worker with configuration
  init(config) {
    this.config = { ...this.config, ...config };
    this.isRunning = true;
    this.postMessage({
      type: 'WORKER_READY',
      data: { status: 'initialized' }
    });
  }

  // Calculate triangular latency measurement
  calculateTriangularLatency(pingTime, serverTime, pongTime) {
    try {
      const roundTripTime = pongTime - pingTime;
      const networkLatency = roundTripTime / 2;
      const serverProcessingTime = serverTime ? (pongTime - serverTime) : 0;
      
      // Validate measurements
      if (isNaN(networkLatency) || networkLatency < 0 || networkLatency > 5000) {
        throw new Error('Invalid latency measurement');
      }

      // Add to history with ring buffer
      this.addToHistory(this.latencyHistory, {
        timestamp: Date.now(),
        networkLatency,
        roundTripTime,
        serverProcessingTime
      });

      const stats = this.calculateLatencyStats();
      
      this.postMessage({
        type: 'LATENCY_CALCULATED',
        data: {
          networkLatency,
          roundTripTime,
          serverProcessingTime,
          stats
        }
      });

      return { networkLatency, roundTripTime, serverProcessingTime, stats };
    } catch (error) {
      this.postMessage({
        type: 'ERROR',
        data: { message: error.message, type: 'LATENCY_CALCULATION' }
      });
      return null;
    }
  }

  // Calculate video drift between expected and actual playback position
  calculateVideoDrift(expectedTime, actualTime, playbackRate = 1) {
    try {
      const rawDrift = expectedTime - actualTime;
      
      // Validate drift measurement
      if (isNaN(rawDrift)) {
        throw new Error('Invalid drift measurement');
      }

      // Account for playback rate
      const adjustedDrift = rawDrift / playbackRate;
      
      // Add to drift history
      this.addToHistory(this.driftHistory, {
        timestamp: Date.now(),
        rawDrift,
        adjustedDrift,
        playbackRate,
        expectedTime,
        actualTime
      });

      const driftStats = this.calculateDriftStats();
      
      this.postMessage({
        type: 'DRIFT_CALCULATED',
        data: {
          rawDrift,
          adjustedDrift,
          playbackRate,
          stats: driftStats
        }
      });

      return { rawDrift, adjustedDrift, stats: driftStats };
    } catch (error) {
      this.postMessage({
        type: 'ERROR',
        data: { message: error.message, type: 'DRIFT_CALCULATION' }
      });
      return null;
    }
  }

  // Calculate optimal playback adjustment
  calculatePlaybackAdjustment(currentTime, targetTime, latency, playbackRate = 1) {
    try {
      const timeDiff = targetTime - currentTime;
      
      // Get recent stats for smart adjustment
      const latencyStats = this.calculateLatencyStats();
      const driftStats = this.calculateDriftStats();
      
      // Use average latency if available, otherwise use provided latency
      const effectiveLatency = latencyStats.average || latency || 0;
      
      // Base correction calculation
      let correction = timeDiff + (effectiveLatency * playbackRate);
      
      // Apply drift compensation if we have drift history
      if (driftStats.trend !== 0) {
        const driftCompensation = driftStats.trend * this.config.driftWeight;
        correction += driftCompensation;
      }
      
      // Apply latency compensation
      if (latencyStats.jitter > 50) {
        // High jitter - be more conservative
        correction *= 0.8;
      }
      
      // Apply maximum correction threshold
      const maxCorrection = this.config.maxCorrection / 1000; // Convert to seconds
      if (Math.abs(correction) > maxCorrection) {
        correction = Math.sign(correction) * maxCorrection;
      }
      
      // Calculate new position
      const newPosition = Math.max(0, currentTime + correction);
      
      // Determine adjustment method
      let adjustmentMethod = 'none';
      if (Math.abs(correction) > this.config.syncThreshold / 1000) {
        adjustmentMethod = Math.abs(correction) > 0.5 ? 'seek' : 'rate_adjust';
      }
      
      const adjustmentData = {
        currentTime,
        targetTime,
        timeDiff,
        effectiveLatency,
        correction,
        newPosition,
        adjustmentMethod,
        confidence: this.calculateConfidence(latencyStats, driftStats)
      };
      
      this.postMessage({
        type: 'ADJUSTMENT_CALCULATED',
        data: adjustmentData
      });

      return adjustmentData;
    } catch (error) {
      this.postMessage({
        type: 'ERROR',
        data: { message: error.message, type: 'ADJUSTMENT_CALCULATION' }
      });
      return null;
    }
  }

  // Add item to history with ring buffer behavior
  addToHistory(history, item) {
    history.push(item);
    if (history.length > this.maxHistorySize) {
      history.shift(); // Remove oldest item
    }
  }

  // Calculate latency statistics
  calculateLatencyStats() {
    if (this.latencyHistory.length === 0) {
      return { average: 0, min: 0, max: 0, jitter: 0, count: 0 };
    }

    const latencies = this.latencyHistory.map(h => h.networkLatency);
    const average = latencies.reduce((a, b) => a + b) / latencies.length;
    const min = Math.min(...latencies);
    const max = Math.max(...latencies);
    const jitter = max - min;
    
    // Calculate trend (positive = increasing latency)
    let trend = 0;
    if (latencies.length >= 3) {
      const recent = latencies.slice(-3);
      trend = (recent[2] - recent[0]) / 2;
    }

    return { average, min, max, jitter, trend, count: latencies.length };
  }

  // Calculate drift statistics
  calculateDriftStats() {
    if (this.driftHistory.length === 0) {
      return { average: 0, min: 0, max: 0, variance: 0, trend: 0, count: 0 };
    }

    const drifts = this.driftHistory.map(h => h.adjustedDrift);
    const average = drifts.reduce((a, b) => a + b) / drifts.length;
    const min = Math.min(...drifts);
    const max = Math.max(...drifts);
    
    // Calculate variance
    const variance = drifts.reduce((acc, drift) => acc + Math.pow(drift - average, 2), 0) / drifts.length;
    
    // Calculate trend (positive = increasing drift)
    let trend = 0;
    if (drifts.length >= 3) {
      const recent = drifts.slice(-3);
      trend = (recent[2] - recent[0]) / 2;
    }

    return { average, min, max, variance, trend, count: drifts.length };
  }

  // Calculate confidence in adjustment recommendation
  calculateConfidence(latencyStats, driftStats) {
    let confidence = 1.0;
    
    // Reduce confidence for high jitter
    if (latencyStats.jitter > 100) {
      confidence *= 0.7;
    }
    
    // Reduce confidence for inconsistent drift
    if (driftStats.variance > 0.1) {
      confidence *= 0.8;
    }
    
    // Reduce confidence for insufficient data
    if (latencyStats.count < 3 || driftStats.count < 3) {
      confidence *= 0.6;
    }
    
    return Math.max(0.1, confidence);
  }

  // Get comprehensive sync statistics
  getSyncStatistics() {
    const latencyStats = this.calculateLatencyStats();
    const driftStats = this.calculateDriftStats();
    
    return {
      latency: latencyStats,
      drift: driftStats,
      history: {
        latencyHistory: this.latencyHistory.slice(-5), // Last 5 measurements
        driftHistory: this.driftHistory.slice(-5)
      },
      config: this.config,
      isRunning: this.isRunning
    };
  }

  // Update worker configuration
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.postMessage({
      type: 'CONFIG_UPDATED',
      data: { config: this.config }
    });
  }

  // Clear history
  clearHistory() {
    this.latencyHistory = [];
    this.driftHistory = [];
    this.postMessage({
      type: 'HISTORY_CLEARED',
      data: { message: 'History cleared' }
    });
  }

  // Stop worker
  stop() {
    this.isRunning = false;
    this.postMessage({
      type: 'WORKER_STOPPED',
      data: { message: 'Worker stopped' }
    });
  }

  // Post message wrapper
  postMessage(message) {
    if (typeof self !== 'undefined' && self.postMessage) {
      self.postMessage(message);
    }
  }
}

// Worker instance
const syncWorker = new VideoSyncWorker();

// Message handler untuk komunikasi dengan main thread
self.onmessage = function(event) {
  const { type, data } = event.data;
  
  try {
    switch (type) {
      case 'INIT':
        syncWorker.init(data.config);
        break;
        
      case 'CALCULATE_LATENCY':
        syncWorker.calculateTriangularLatency(
          data.pingTime,
          data.serverTime,
          data.pongTime
        );
        break;
        
      case 'CALCULATE_DRIFT':
        syncWorker.calculateVideoDrift(
          data.expectedTime,
          data.actualTime,
          data.playbackRate
        );
        break;
        
      case 'CALCULATE_ADJUSTMENT':
        syncWorker.calculatePlaybackAdjustment(
          data.currentTime,
          data.targetTime,
          data.latency,
          data.playbackRate
        );
        break;
        
      case 'GET_STATS':
        const stats = syncWorker.getSyncStatistics();
        self.postMessage({
          type: 'STATS_RESPONSE',
          data: stats
        });
        break;
        
      case 'UPDATE_CONFIG':
        syncWorker.updateConfig(data.config);
        break;
        
      case 'CLEAR_HISTORY':
        syncWorker.clearHistory();
        break;
        
      case 'STOP':
        syncWorker.stop();
        break;
        
      default:
        self.postMessage({
          type: 'ERROR',
          data: { message: `Unknown message type: ${type}` }
        });
    }
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      data: { 
        message: error.message,
        type: 'MESSAGE_HANDLER_ERROR',
        originalType: type
      }
    });
  }
};
