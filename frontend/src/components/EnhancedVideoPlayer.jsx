import React, { useEffect } from 'react';
import { useVideoControl, usePlaybackState, useUserRole } from '../hooks/useGlobalStore';
import useVideoStore from '../store/videoStore';
import { Play, Pause, Volume2, VolumeX, Settings } from 'lucide-react';

/**
 * Enhanced Video Player using Global Store
 * Integrates with triangular sync and role-based permissions
 */
const EnhancedVideoPlayer = () => {
  const {
    currentVideo,
    playVideo,
    pausePlayback,
    seekVideo,
    setVolume,
    toggleMute,
    setPlaybackRate,
    updatePlaybackTime
  } = useVideoControl();

  const {
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    playbackRate,
    isLoading,
    error,
    progress,
    isVideoReady,
    hasError
  } = usePlaybackState();

  const {
    canControlPlayback,
    userRole,
    isHost,
    isModerator
  } = useUserRole();

  // Access WebWorker methods from store
  const { initializeWorker, destroyWorker, workerInitialized } = useVideoStore();

  // Initialize WebWorker on component mount
  useEffect(() => {
    if (!workerInitialized) {
      const initWorker = async () => {
        try {
          const success = await initializeWorker({
            maxCorrection: 500,
            syncThreshold: 100,
            latencyWeight: 0.7,
            driftWeight: 0.3
          });
          
          if (success) {
            console.log('VideoSync WebWorker initialized for EnhancedVideoPlayer');
          }
        } catch (error) {
          console.warn('Failed to initialize WebWorker:', error);
        }
      };
      
      initWorker();
    }

    // Cleanup on unmount
    return () => {
      if (workerInitialized) {
        destroyWorker();
      }
    };
  }, [initializeWorker, destroyWorker, workerInitialized]);

  // Format time helper
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle video element events
  const handleTimeUpdate = (e) => {
    updatePlaybackTime(e.target.currentTime);
  };

  const handleSeek = (e) => {
    if (!canControlPlayback) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    seekVideo(newTime);
  };

  const handleVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value));
  };

  const handlePlaybackRateChange = (rate) => {
    if (!canControlPlayback) return;
    setPlaybackRate(rate);
  };

  if (!currentVideo) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-900 rounded-lg">
        <div className="text-center text-gray-400">
          <div className="text-lg mb-2">No video selected</div>
          {isHost && (
            <div className="text-sm">Select a video to start watching together</div>
          )}
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center h-64 bg-red-900/20 border border-red-500/50 rounded-lg">
        <div className="text-center text-red-400">
          <div className="text-lg mb-2">Video Error</div>
          <div className="text-sm">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-black rounded-lg overflow-hidden shadow-xl">
      {/* Video Element */}
      <div className="relative aspect-video">
        <video
          key={currentVideo.id}
          className="w-full h-full object-contain"
          src={currentVideo.url}
          onTimeUpdate={handleTimeUpdate}
          onPlay={playVideo}
          onPause={pausePlayback}
          onLoadedMetadata={(e) => {
            // Video loaded, duration available
            console.log('Video duration:', e.target.duration);
          }}
          poster={currentVideo.thumbnail}
        />
        
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
          </div>
        )}

        {/* Role Badge */}
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            userRole === 'host' ? 'bg-purple-500 text-white' :
            userRole === 'moderator' ? 'bg-blue-500 text-white' :
            'bg-gray-500 text-white'
          }`}>
            {userRole.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-900 p-4 space-y-3">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div 
            className="w-full h-2 bg-gray-700 rounded-full cursor-pointer"
            onClick={handleSeek}
          >
            <div 
              className="h-full bg-purple-500 rounded-full transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="flex justify-between text-xs text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Main Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Play/Pause */}
            <button
              onClick={isPlaying ? pausePlayback : playVideo}
              disabled={!canControlPlayback}
              className={`p-2 rounded-full transition-colors ${
                canControlPlayback 
                  ? 'hover:bg-gray-700 text-white' 
                  : 'text-gray-500 cursor-not-allowed'
              }`}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>

            {/* Volume */}
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleMute}
                className="p-1 text-gray-300 hover:text-white transition-colors"
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-xs text-gray-400 w-8">
                {Math.round((isMuted ? 0 : volume) * 100)}%
              </span>
            </div>

            {/* Playback Rate */}
            {(isHost || isModerator) && (
              <div className="flex items-center space-x-1">
                <span className="text-xs text-gray-400">Speed:</span>
                <select
                  value={playbackRate}
                  onChange={(e) => handlePlaybackRateChange(parseFloat(e.target.value))}
                  className="bg-gray-800 text-white text-xs rounded px-2 py-1 border border-gray-600"
                >
                  <option value={0.5}>0.5x</option>
                  <option value={0.75}>0.75x</option>
                  <option value={1}>1x</option>
                  <option value={1.25}>1.25x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={2}>2x</option>
                </select>
              </div>
            )}
          </div>

          {/* Video Info */}
          <div className="text-right">
            <div className="text-sm font-medium text-white">
              {currentVideo.title}
            </div>
            {currentVideo.metadata?.genre && (
              <div className="text-xs text-gray-400">
                {currentVideo.metadata.genre} • {currentVideo.metadata.year}
              </div>
            )}
          </div>
        </div>

        {/* Permission Notice */}
        {!canControlPlayback && (
          <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-700">
            Only hosts and moderators can control playback
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedVideoPlayer;
