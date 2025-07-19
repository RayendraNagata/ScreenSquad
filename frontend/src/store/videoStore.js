import { create } from 'zustand';

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

  // Actions
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
