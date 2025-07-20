import React, { useState } from 'react';
import Button from '../ui/Button';

const VideoManager = ({ isHost, onVideoSelect, currentVideo }) => {
  console.log('VideoManager rendered with props:', { isHost, hasOnVideoSelect: !!onVideoSelect, currentVideo });
  
  const [showAddVideo, setShowAddVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoLibrary, setVideoLibrary] = useState([
    {
      id: '1',
      title: 'IVE - LOVE DIVE',
      url: 'https://www.youtube.com/watch?v=Y8JFxS1HlDo',
      type: 'youtube',
      thumbnail: 'https://img.youtube.com/vi/Y8JFxS1HlDo/maxresdefault.jpg',
      duration: '2:58',
      addedBy: 'You',
      addedAt: new Date().toISOString()
    },
    {
      id: '2', 
      title: 'IVE - After LIKE',
      url: 'https://www.youtube.com/watch?v=F0B7HDiY-10',
      type: 'youtube',
      thumbnail: 'https://img.youtube.com/vi/F0B7HDiY-10/maxresdefault.jpg',
      duration: '2:56',
      addedBy: 'You',
      addedAt: new Date().toISOString()
    },
    {
      id: '3',
      title: 'Hearts2Hearts - STYLE',
      url: 'https://www.youtube.com/watch?v=n7kFRxFIPrI',
      type: 'youtube',
      thumbnail: 'https://img.youtube.com/vi/n7kFRxFIPrI/maxresdefault.jpg',
      duration: '3:28',
      addedBy: 'You',
      addedAt: new Date().toISOString()
    },
    {
      id: '4',
      title: 'IVE - I AM',
      url: 'https://www.youtube.com/watch?v=6ZUIwj3FgUY',
      type: 'youtube',
      thumbnail: 'https://img.youtube.com/vi/6ZUIwj3FgUY/maxresdefault.jpg',
      duration: '3:07',
      addedBy: 'You',
      addedAt: new Date().toISOString()
    }
  ]);

  const detectVideoType = (url) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    } else if (url.includes('drive.google.com')) {
      return 'googledrive';
    } else if (url.match(/\.(mp4|webm|ogg|avi|mov)$/i)) {
      return 'direct';
    }
    return 'embed';
  };

  const extractYouTubeId = (url) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  const generateThumbnail = (url, type) => {
    if (type === 'youtube') {
      const videoId = extractYouTubeId(url);
      return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
    }
    return '/api/placeholder/320/180';
  };

  const handleAddVideo = () => {
    if (!videoUrl.trim()) return;

    const type = detectVideoType(videoUrl);
    const title = videoTitle.trim() || `Video ${videoLibrary.length + 1}`;
    const thumbnail = generateThumbnail(videoUrl, type);

    const newVideo = {
      id: Date.now().toString(),
      title,
      url: videoUrl,
      type,
      thumbnail,
      duration: 'Unknown',
      addedBy: 'You',
      addedAt: new Date().toISOString()
    };

    setVideoLibrary([...videoLibrary, newVideo]);
    setVideoUrl('');
    setVideoTitle('');
    setShowAddVideo(false);
  };

  const handleVideoSelect = (video) => {
    console.log('=== VideoManager: handleVideoSelect called ===');
    console.log('Video:', video);
    console.log('onVideoSelect callback exists:', !!onVideoSelect);
    console.log('onVideoSelect type:', typeof onVideoSelect);
    
    if (onVideoSelect) {
      console.log('Calling onVideoSelect...');
      onVideoSelect(video);
      console.log('onVideoSelect called successfully');
    } else {
      console.warn('VideoManager: No onVideoSelect callback provided');
    }
  };

  const handleStartScreenShare = async () => {
    try {
      console.log('VideoManager: Attempting to start screen share...');
      
      // Check if browser supports getDisplayMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        throw new Error('Screen sharing not supported in this browser');
      }

      // Check if we're on HTTPS (required for screen sharing)
      if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        throw new Error('Screen sharing requires HTTPS or localhost');
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          mediaSource: 'screen',
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
          frameRate: { ideal: 30, max: 60 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });

      console.log('VideoManager: Screen share stream obtained:', stream);

      const screenVideo = {
        id: 'screen-' + Date.now(),
        title: 'Screen Share',
        url: URL.createObjectURL(stream),
        type: 'screen-share',
        thumbnail: '/api/placeholder/320/180',
        duration: 'Live',
        addedBy: 'You',
        addedAt: new Date().toISOString(),
        stream: stream
      };

      console.log('VideoManager: Starting screen share:', screenVideo);
      onVideoSelect?.(screenVideo);

      // Stop screen share when stream ends
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        console.log('VideoManager: Screen share ended by user');
        // Optionally notify parent component or reset video
      });

    } catch (error) {
      console.error('VideoManager: Screen share failed:', error);
      
      let errorMessage = 'Screen sharing failed. ';
      
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Permission denied. Please allow screen sharing when prompted.';
      } else if (error.name === 'NotSupportedError') {
        errorMessage += 'Screen sharing not supported in this browser. Try Chrome, Firefox, or Edge.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No screen available to share.';
      } else if (error.name === 'AbortError') {
        errorMessage += 'Screen sharing was cancelled.';
      } else if (error.message.includes('HTTPS')) {
        errorMessage += 'HTTPS is required for screen sharing (except on localhost).';
      } else if (error.message.includes('not supported')) {
        errorMessage += 'Your browser does not support screen sharing.';
      } else {
        errorMessage += `Error: ${error.message}`;
      }
      
      alert(errorMessage);
    }
  };

  const handleRemoveVideo = (videoId) => {
    setVideoLibrary(videoLibrary.filter(v => v.id !== videoId));
  };

  const getVideoTypeIcon = (type, iconClass = "w-4 h-4") => {
    switch (type) {
      case 'youtube':
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        );
      case 'googledrive':
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
            <path d="M6.26 10.5l2.3-4.02L12 10.5H6.26zm7.74 0l-2.3-4.02-2.3 4.02H14zm-1.39 1.5L12 13.48 10.39 12H12zm-4.35 1.5L6.87 16.5H4.52L6.26 12zm2.74 0l1.65 4.5h3.48l-1.65-4.5H10zm3.74-1.5h5.74l-1.74-3H14zm-7.74 0H2.26l1.74-3H8.6z"/>
          </svg>
        );
      case 'direct':
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2l4.5 3-4.5 3V5z" clipRule="evenodd" />
          </svg>
        );
      case 'screen-share':
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2l4.5 3-4.5 3V5z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const Card = ({ children, className = "", onClick }) => (
    <div 
      className={`rounded-lg shadow-lg ${className}`} 
      onClick={onClick}
      style={{ 
        pointerEvents: 'auto',
        userSelect: 'none'
      }}
    >
      {children}
    </div>
  );

  return (
    <div className="w-full max-h-96 bg-gray-800 text-white overflow-hidden flex flex-col rounded-lg">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
              </svg>
              Video Library
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              {videoLibrary.length} video{videoLibrary.length !== 1 ? 's' : ''}
            </p>
          </div>
          {isHost && (
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setShowAddVideo(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center px-3 py-2 text-sm flex-shrink-0"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Add Video</span>
                <span className="sm:hidden">Add</span>
              </Button>
              <Button
                onClick={handleStartScreenShare}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center px-3 py-2 text-sm flex-shrink-0"
                title="Share your screen with the squad"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="hidden sm:inline">Share Screen</span>
                <span className="sm:hidden">Share</span>
              </Button>
            </div>
          )}
        </div>

        {/* Add Video Form */}
        {showAddVideo && isHost && (
          <div className="bg-gray-700 rounded-lg p-4 border border-gray-600 mt-3">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-base font-medium text-white">Add Video</h4>
              <Button
                onClick={() => {
                  setShowAddVideo(false);
                  setVideoUrl('');
                  setVideoTitle('');
                }}
                variant="ghost"
                className="text-gray-400 hover:text-white p-1"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="Enter video title..."
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Video URL
                </label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="Paste video URL here..."
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                />
              </div>

              <div className="flex space-x-2 pt-1">
                <Button
                  onClick={handleAddVideo}
                  disabled={!videoUrl.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 text-sm"
                >
                  Add Video
                </Button>
                <Button
                  onClick={() => {
                    setShowAddVideo(false);
                    setVideoUrl('');
                    setVideoTitle('');
                  }}
                  variant="outline"
                  className="px-4 py-2 border border-gray-500 text-gray-300 hover:bg-gray-700 text-sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Video Library */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {videoLibrary.length === 0 ? (
            <Card className="p-8 text-center bg-gray-700 border-gray-600">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-600 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2l4.5 3-4.5 3V5z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No Videos Yet</h3>
              <p className="text-gray-400 text-sm">
                {isHost ? 'Add your first video to get started!' : 'Waiting for videos to be added...'}
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {videoLibrary.map((video) => (
                <Card 
                  key={video.id} 
                  className="bg-gray-700 border border-gray-600 hover:border-gray-500 hover:bg-gray-600 transition-all cursor-pointer group select-none"
                  onClick={(e) => {
                    console.log('=== CARD CLICK EVENT ===');
                    console.log('Event target:', e.target);
                    console.log('Video title:', video.title);
                    console.log('Video data:', video);
                    handleVideoSelect(video);
                  }}
                >
                  <div className="flex gap-3 p-3">
                    {/* Video Thumbnail */}
                    <div className="relative flex-shrink-0 w-32 h-20 bg-gray-600 rounded-lg overflow-hidden">
                      {video.thumbnail && video.thumbnail !== '/api/placeholder/320/180' ? (
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          onError={(e) => {
                            console.log('Thumbnail failed to load for:', video.title);
                            e.target.style.display = 'none';
                            e.target.parentElement.querySelector('.fallback-icon').style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="fallback-icon w-full h-full bg-gray-600 flex items-center justify-center" style={{ display: video.thumbnail && video.thumbnail !== '/api/placeholder/320/180' ? 'none' : 'flex' }}>
                        {getVideoTypeIcon(video.type, "w-5 h-5 text-gray-400")}
                      </div>

                      {/* Duration Badge */}
                      <div className="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-xs px-1.5 py-0.5 rounded">
                        {video.duration}
                      </div>

                      {/* Video Type Badge */}
                      <div className="absolute top-1 left-1 bg-black bg-opacity-75 text-white text-xs px-1.5 py-0.5 rounded flex items-center">
                        {getVideoTypeIcon(video.type, "w-2.5 h-2.5 mr-1")}
                        {video.type === 'youtube' ? 'YT' : 
                         video.type === 'googledrive' ? 'GD' : 
                         video.type === 'screen-share' ? 'SS' : 'VID'}
                      </div>
                    </div>

                    {/* Video Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-white mb-1 line-clamp-2 group-hover:text-blue-400 transition-colors">
                            {video.title}
                          </h4>
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>Added by {video.addedBy}</span>
                            {currentVideo && currentVideo.id === video.id && (
                              <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium ml-2">
                                Now Playing
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Added {new Date(video.addedAt).toLocaleDateString()}
                          </div>
                        </div>

                        {/* Remove Button (Host Only) */}
                        {isHost && (
                          <Button
                            onClick={(e) => {
                              console.log('Remove button clicked');
                              e.stopPropagation();
                              e.preventDefault();
                              handleRemoveVideo(video.id);
                            }}
                            className="w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity p-0 ml-2 flex-shrink-0"
                            title="Remove video"
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoManager;
