import React, { useState, useEffect, useRef } from 'react';
import Button from '../ui/Button';

const VideoPlayer = ({ 
  videoUrl, 
  isHost, 
  onTimeUpdate, 
  onPlay, 
  onPause, 
  syncTime, 
  isPlaying 
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoType, setVideoType] = useState('unknown');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const iframeRef = useRef(null);

  // Detect video type from URL
  useEffect(() => {
    if (!videoUrl) {
      setVideoType('none');
      return;
    }

    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      setVideoType('youtube');
    } else if (videoUrl.includes('drive.google.com')) {
      setVideoType('googledrive');
    } else if (videoUrl.match(/\.(mp4|webm|ogg|avi|mov)$/i)) {
      setVideoType('direct');
    } else {
      setVideoType('embed');
    }
  }, [videoUrl]);

  // Sync video time when host updates
  useEffect(() => {
    if (!isHost && syncTime !== undefined && videoRef.current) {
      const timeDiff = Math.abs(videoRef.current.currentTime - syncTime);
      if (timeDiff > 2) { // Only sync if difference is > 2 seconds
        videoRef.current.currentTime = syncTime;
      }
    }
  }, [syncTime, isHost]);

  // Sync play/pause state
  useEffect(() => {
    if (!isHost && videoRef.current) {
      if (isPlaying && videoRef.current.paused) {
        videoRef.current.play();
      } else if (!isPlaying && !videoRef.current.paused) {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, isHost]);

  const handleTimeUpdate = () => {
    if (videoRef.current && isHost) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);
      onTimeUpdate?.(time);
    }
  };

  const handlePlay = () => {
    if (isHost) {
      onPlay?.();
    } else if (!isHost) {
      // Non-hosts can't control playback
      videoRef.current?.pause();
    }
  };

  const handlePause = () => {
    if (isHost) {
      onPause?.();
    }
  };

  const handleSeek = (e) => {
    if (!isHost || !videoRef.current) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    
    videoRef.current.currentTime = newTime;
    onTimeUpdate?.(newTime);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const extractYouTubeId = (url) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  const extractGoogleDriveId = (url) => {
    const regExp = /\/d\/([a-zA-Z0-9_-]+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };

  const renderVideoPlayer = () => {
    if (!videoUrl) {
      return (
        <div className="w-full h-full bg-gray-900 flex items-center justify-center text-white">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">No Video Selected</h3>
            <p className="text-gray-400">Host needs to select a video to start watching together</p>
          </div>
        </div>
      );
    }

    switch (videoType) {
      case 'youtube':
        const youtubeId = extractYouTubeId(videoUrl);
        console.log('VideoPlayer: YouTube ID extracted:', youtubeId, 'from URL:', videoUrl);
        if (!youtubeId) {
          return (
            <div className="w-full h-full bg-red-900 flex items-center justify-center text-white">
              <div className="text-center">
                <p>Invalid YouTube URL</p>
                <p className="text-sm text-gray-300 mt-2">{videoUrl}</p>
              </div>
            </div>
          );
        }
        return (
          <iframe
            ref={iframeRef}
            src={`https://www.youtube.com/embed/${youtubeId}?enablejsapi=1&rel=0&modestbranding=1&controls=${isHost ? 1 : 0}&autoplay=0`}
            className="w-full h-full"
            frameBorder="0"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            onLoad={() => {
              console.log('VideoPlayer: YouTube iframe loaded');
              setLoading(false);
            }}
            onError={() => {
              console.error('VideoPlayer: YouTube iframe error');
              setError('Failed to load YouTube video');
            }}
          />
        );

      case 'googledrive':
        const driveId = extractGoogleDriveId(videoUrl);
        console.log('VideoPlayer: Google Drive ID extracted:', driveId, 'from URL:', videoUrl);
        if (!driveId) {
          return (
            <div className="w-full h-full bg-red-900 flex items-center justify-center text-white">
              <div className="text-center">
                <p>Invalid Google Drive URL</p>
                <p className="text-sm text-gray-300 mt-2">{videoUrl}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Use: https://drive.google.com/file/d/FILE_ID/view
                </p>
              </div>
            </div>
          );
        }
        return (
          <iframe
            ref={iframeRef}
            src={`https://drive.google.com/file/d/${driveId}/preview`}
            className="w-full h-full"
            frameBorder="0"
            allowFullScreen
            onLoad={() => {
              console.log('VideoPlayer: Google Drive iframe loaded');
              setLoading(false);
            }}
            onError={() => {
              console.error('VideoPlayer: Google Drive iframe error');
              setError('Failed to load Google Drive video');
            }}
          />
        );

      case 'direct':
        return (
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full"
            controls={isHost}
            onTimeUpdate={handleTimeUpdate}
            onPlay={handlePlay}
            onPause={handlePause}
            onLoadedMetadata={() => {
              setDuration(videoRef.current.duration);
              setLoading(false);
            }}
            onError={() => setError('Failed to load video')}
          />
        );

      case 'screen-share':
        return (
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full"
            controls={isHost}
            autoPlay
            muted={false}
            onTimeUpdate={handleTimeUpdate}
            onPlay={handlePlay}
            onPause={handlePause}
            onLoadedMetadata={() => {
              setDuration(videoRef.current.duration || 0);
              setLoading(false);
            }}
            onError={() => setError('Failed to load screen share')}
          />
        );

      case 'embed':
      default:
        return (
          <iframe
            ref={iframeRef}
            src={videoUrl}
            className="w-full h-full"
            frameBorder="0"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        );
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`relative bg-black rounded-lg overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : 'aspect-video'}`}
    >
      {/* Video Container */}
      <div className="relative w-full h-full">
        {renderVideoPlayer()}
        
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>Loading video...</p>
            </div>
          </div>
        )}

        {/* Error Overlay */}
        {error && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="text-6xl mb-4">❌</div>
              <p className="text-xl mb-2">Error Loading Video</p>
              <p className="text-gray-400">{error}</p>
            </div>
          </div>
        )}

        {/* Custom Controls for Direct Video */}
        {videoType === 'direct' && !loading && !error && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
            {/* Progress Bar */}
            <div className="mb-4">
              <div 
                className="w-full h-2 bg-gray-600 rounded cursor-pointer"
                onClick={handleSeek}
              >
                <div 
                  className="h-full bg-red-600 rounded"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-4">
                {isHost && (
                  <Button
                    onClick={() => {
                      if (videoRef.current.paused) {
                        videoRef.current.play();
                      } else {
                        videoRef.current.pause();
                      }
                    }}
                    variant="ghost"
                    className="text-white hover:bg-white hover:bg-opacity-20"
                  >
                    {isPlaying ? '⏸️' : '▶️'}
                  </Button>
                )}
                
                <span className="text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center space-x-4">
                {/* Volume Control */}
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.772L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.797-3.772a1 1 0 011 .848zM11 5a1 1 0 011.993-.117A6 6 0 0115 10a6 6 0 01-2.007 4.472 1 1 0 11-1.986-.954A4 4 0 0013 10a4 4 0 00-2-3.472V5z" clipRule="evenodd" />
                  </svg>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => {
                      const newVolume = parseFloat(e.target.value);
                      setVolume(newVolume);
                      if (videoRef.current) {
                        videoRef.current.volume = newVolume;
                      }
                    }}
                    className="w-20"
                  />
                </div>

                {/* Fullscreen Button */}
                <Button
                  onClick={toggleFullscreen}
                  variant="ghost"
                  className="text-white hover:bg-white hover:bg-opacity-20"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Host/Member Indicator */}
        <div className="absolute top-4 right-4">
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            isHost ? 'bg-blue-600 text-white' : 'bg-gray-600 text-white'
          }`}>
            {isHost ? 'HOST • CONTROLS ENABLED' : 'MEMBER • VIEW ONLY'}
          </div>
        </div>

        {/* Sync Status */}
        {!isHost && (
          <div className="absolute top-4 left-4">
            <div className="px-3 py-1 rounded-full text-xs font-medium bg-green-600 text-white flex items-center">
              <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
              SYNCED
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
