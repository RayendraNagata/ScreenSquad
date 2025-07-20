import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Global Store with Zustand
 * Provides consolidated state management for video, playback, and user role
 */
const useGlobalStore = create(
  persist(
    (set, get) => ({
      // Current Video State
      currentVideo: null,
      
      // Playback State Object
      playbackState: {
        isPlaying: false,
        isPaused: true,
        currentTime: 0,
        duration: 0,
        volume: 0.5,
        isMuted: false,
        playbackRate: 1,
        quality: 'auto',
        buffered: 0,
        isLoading: false,
        error: null,
        lastSyncTime: 0
      },
      
      // User Role State
      userRole: 'viewer', // 'host', 'moderator', 'viewer'
      
      // Additional state
      squadId: null,
      isConnected: false,
      
      // Actions for Video Management
      setVideo: (videoData, metadata = {}) => {
        const video = {
          id: videoData.id || Date.now().toString(),
          url: videoData.url,
          title: videoData.title || 'Untitled Video',
          thumbnail: videoData.thumbnail || `https://via.placeholder.com/320x180/1f2937/ffffff?text=Video`,
          duration: videoData.duration || 0,
          type: videoData.type || 'video/mp4',
          source: videoData.source || 'direct',
          loadedAt: new Date().toISOString(),
          ...metadata
        };
        
        set({
          currentVideo: video,
          playbackState: {
            ...get().playbackState,
            isLoading: false,
            currentTime: 0,
            isPlaying: false,
            isPaused: true,
            error: null,
            lastSyncTime: Date.now()
          }
        });
        
        console.log('Video set:', video.title);
        return { success: true, video };
      },
      
      // Actions for Playback Control
      pausePlayback: () => {
        const currentState = get().playbackState;
        
        set({
          playbackState: {
            ...currentState,
            isPlaying: false,
            isPaused: true,
            lastSyncTime: Date.now()
          }
        });
        
        console.log('Playback paused');
        return { success: true, action: 'pause' };
      },
      
      playVideo: () => {
        const currentState = get().playbackState;
        
        set({
          playbackState: {
            ...currentState,
            isPlaying: true,
            isPaused: false,
            lastSyncTime: Date.now()
          }
        });
        
        console.log('Video playing');
        return { success: true, action: 'play' };
      },
      
      seekVideo: (time) => {
        const currentState = get().playbackState;
        const validTime = Math.max(0, Math.min(time, currentState.duration || 0));
        
        set({
          playbackState: {
            ...currentState,
            currentTime: validTime,
            lastSyncTime: Date.now()
          }
        });
        
        console.log(`Video seeked to: ${validTime}s`);
        return { success: true, action: 'seek', time: validTime };
      },
      
      updatePlaybackTime: (time) => {
        const currentState = get().playbackState;
        
        set({
          playbackState: {
            ...currentState,
            currentTime: time
          }
        });
      },
      
      setVolume: (volume) => {
        const currentState = get().playbackState;
        const validVolume = Math.max(0, Math.min(1, volume));
        
        set({
          playbackState: {
            ...currentState,
            volume: validVolume,
            isMuted: validVolume === 0
          }
        });
        
        return { success: true, volume: validVolume };
      },
      
      toggleMute: () => {
        const currentState = get().playbackState;
        
        set({
          playbackState: {
            ...currentState,
            isMuted: !currentState.isMuted
          }
        });
        
        return { success: true, isMuted: !currentState.isMuted };
      },
      
      setPlaybackRate: (rate) => {
        const currentState = get().playbackState;
        const validRate = Math.max(0.25, Math.min(2, rate));
        
        set({
          playbackState: {
            ...currentState,
            playbackRate: validRate
          }
        });
        
        return { success: true, playbackRate: validRate };
      },
      
      // Actions for User Role Management
      changeRole: (newRole) => {
        const validRoles = ['host', 'moderator', 'viewer'];
        
        if (!validRoles.includes(newRole)) {
          console.warn(`Invalid role: ${newRole}. Valid roles: ${validRoles.join(', ')}`);
          return { success: false, error: 'Invalid role' };
        }
        
        const previousRole = get().userRole;
        
        set({
          userRole: newRole
        });
        
        console.log(`Role changed from ${previousRole} to ${newRole}`);
        return { 
          success: true, 
          previousRole, 
          currentRole: newRole 
        };
      },
      
      // Squad and Connection Management
      joinSquad: (squadId, role = 'viewer') => {
        set({
          squadId,
          userRole: role,
          isConnected: true
        });
        
        console.log(`Joined squad ${squadId} as ${role}`);
        return { success: true, squadId, role };
      },
      
      leaveSquad: () => {
        const currentSquadId = get().squadId;
        
        set({
          squadId: null,
          userRole: 'viewer',
          isConnected: false,
          currentVideo: null,
          playbackState: {
            ...get().playbackState,
            isPlaying: false,
            isPaused: true,
            currentTime: 0
          }
        });
        
        console.log(`Left squad ${currentSquadId}`);
        return { success: true, leftSquadId: currentSquadId };
      },
      
      // Utility Actions
      resetPlaybackState: () => {
        set({
          playbackState: {
            isPlaying: false,
            isPaused: true,
            currentTime: 0,
            duration: 0,
            volume: 0.5,
            isMuted: false,
            playbackRate: 1,
            quality: 'auto',
            buffered: 0,
            isLoading: false,
            error: null,
            lastSyncTime: Date.now()
          }
        });
        
        return { success: true };
      },
      
      setError: (error) => {
        const currentState = get().playbackState;
        
        set({
          playbackState: {
            ...currentState,
            error: error,
            isLoading: false
          }
        });
        
        console.error('Playback error:', error);
        return { success: true, error };
      },
      
      clearError: () => {
        const currentState = get().playbackState;
        
        set({
          playbackState: {
            ...currentState,
            error: null
          }
        });
        
        return { success: true };
      },
      
      // Getters (computed values)
      getPermissions: () => {
        const role = get().userRole;
        
        const permissions = {
          host: {
            canControlPlayback: true,
            canChangeVideo: true,
            canKickMembers: true,
            canChangeSettings: true,
            canPromoteMembers: true
          },
          moderator: {
            canControlPlayback: true,
            canChangeVideo: true,
            canKickMembers: false,
            canChangeSettings: false,
            canPromoteMembers: false
          },
          viewer: {
            canControlPlayback: false,
            canChangeVideo: false,
            canKickMembers: false,
            canChangeSettings: false,
            canPromoteMembers: false
          }
        };
        
        return permissions[role] || permissions.viewer;
      },
      
      getPlaybackInfo: () => {
        const state = get();
        return {
          currentVideo: state.currentVideo,
          playbackState: state.playbackState,
          userRole: state.userRole,
          squadId: state.squadId,
          isConnected: state.isConnected,
          permissions: state.getPermissions()
        };
      }
    }),
    {
      name: 'screensquad-global-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        userRole: state.userRole,
        squadId: state.squadId,
        // Don't persist playback state and current video for fresh sessions
      })
    }
  )
);

export default useGlobalStore;
