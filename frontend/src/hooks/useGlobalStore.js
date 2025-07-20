import { useCallback } from 'react';
import useGlobalStore from '../store/globalStore';

/**
 * Custom hooks for Global Store
 * Provides convenient access to specific parts of the global state
 */

// Video Management Hook
export const useVideoControl = () => {
  const { 
    currentVideo, 
    setVideo, 
    playVideo, 
    pausePlayback, 
    seekVideo, 
    updatePlaybackTime,
    setVolume,
    toggleMute,
    setPlaybackRate,
    resetPlaybackState,
    setError,
    clearError
  } = useGlobalStore();

  return {
    currentVideo,
    setVideo: useCallback(setVideo, [setVideo]),
    playVideo: useCallback(playVideo, [playVideo]),
    pausePlayback: useCallback(pausePlayback, [pausePlayback]),
    seekVideo: useCallback(seekVideo, [seekVideo]),
    updatePlaybackTime: useCallback(updatePlaybackTime, [updatePlaybackTime]),
    setVolume: useCallback(setVolume, [setVolume]),
    toggleMute: useCallback(toggleMute, [toggleMute]),
    setPlaybackRate: useCallback(setPlaybackRate, [setPlaybackRate]),
    resetPlaybackState: useCallback(resetPlaybackState, [resetPlaybackState]),
    setError: useCallback(setError, [setError]),
    clearError: useCallback(clearError, [clearError])
  };
};

// Playback State Hook
export const usePlaybackState = () => {
  const { playbackState } = useGlobalStore();
  
  return {
    ...playbackState,
    isVideoReady: !!playbackState.duration,
    hasError: !!playbackState.error,
    isBuffering: playbackState.isLoading,
    progress: playbackState.duration > 0 ? (playbackState.currentTime / playbackState.duration) * 100 : 0
  };
};

// User Role Hook
export const useUserRole = () => {
  const { 
    userRole, 
    changeRole, 
    getPermissions,
    squadId,
    isConnected,
    joinSquad,
    leaveSquad
  } = useGlobalStore();

  const permissions = getPermissions();

  return {
    userRole,
    permissions,
    squadId,
    isConnected,
    changeRole: useCallback(changeRole, [changeRole]),
    joinSquad: useCallback(joinSquad, [joinSquad]),
    leaveSquad: useCallback(leaveSquad, [leaveSquad]),
    
    // Permission checkers
    canControlPlayback: permissions.canControlPlayback,
    canChangeVideo: permissions.canChangeVideo,
    canKickMembers: permissions.canKickMembers,
    canChangeSettings: permissions.canChangeSettings,
    canPromoteMembers: permissions.canPromoteMembers,
    
    // Role checkers
    isHost: userRole === 'host',
    isModerator: userRole === 'moderator',
    isViewer: userRole === 'viewer',
    hasPrivileges: userRole === 'host' || userRole === 'moderator'
  };
};

// Combined Playback Info Hook
export const usePlaybackInfo = () => {
  const { getPlaybackInfo } = useGlobalStore();
  return getPlaybackInfo();
};

// Simplified Action Hooks
export const useVideoActions = () => {
  const { setVideo, pausePlayback, playVideo, seekVideo } = useGlobalStore();
  
  return {
    setVideo: useCallback(setVideo, [setVideo]),
    pausePlayback: useCallback(pausePlayback, [pausePlayback]),
    playVideo: useCallback(playVideo, [playVideo]),
    seekVideo: useCallback(seekVideo, [seekVideo])
  };
};

export const useRoleActions = () => {
  const { changeRole, joinSquad, leaveSquad } = useGlobalStore();
  
  return {
    changeRole: useCallback(changeRole, [changeRole]),
    joinSquad: useCallback(joinSquad, [joinSquad]),
    leaveSquad: useCallback(leaveSquad, [leaveSquad])
  };
};

// Global Store Hook (full access)
export const useGlobal = () => {
  return useGlobalStore();
};
