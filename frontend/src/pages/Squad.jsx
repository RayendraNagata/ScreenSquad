import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../store/authStore';
import useSquadStore from '../store/squadStore_fixed';
import useSocketStore from '../store/socketStore';
import useVideoStore from '../store/videoStore';
import { useUserRole, useVideoControl, usePlaybackState } from '../hooks/useGlobalStore';
import useDriftCorrection from '../hooks/useDriftCorrection';
import { Card, Avatar } from '../components/ui/index.jsx';
import Button from '../components/ui/Button';
import DriftMonitor from '../components/DriftMonitor';
import DriftSettings from '../components/DriftSettings';
import EnhancedVideoPlayer from '../components/EnhancedVideoPlayer';
import RoleManager from '../components/RoleManager';
import VideoLibrary from '../components/VideoLibrary';
import WebWorkerDebugMonitor from '../components/WebWorkerDebugMonitor';
import ConnectionStatus from '../components/ConnectionStatus';
import { launchConnectionStatusDemo } from '../components/ConnectionStatusDemo';

const Squad = () => {
  const { squadId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentSquad, fetchSquadById, isLoading: squadLoading, error: squadError } = useSquadStore();
  const { socket, isConnected } = useSocketStore();
  
  console.log('Squad component render:', { squadId, user, currentSquad, squadLoading, squadError });
  
  // Global Store Hooks
  const { currentVideo } = useVideoControl();
  const { isPlaying } = usePlaybackState();
  const { joinSquad } = useUserRole();
  
  // WebWorker initialization
  const { initializeWorker, workerInitialized, performFullSyncWithWorker } = useVideoStore();
  
  // Initialize drift correction
  const driftCorrection = useDriftCorrection(isConnected && currentVideo, 3000);
  
  const [showChat, setShowChat] = useState(true);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [reactions, setReactions] = useState([]);
  const [showVideoLibrary, setShowVideoLibrary] = useState(false);
  const [showRoleManager, setShowRoleManager] = useState(false);
  const [members, setMembers] = useState([]);
  const [syncStatus, setSyncStatus] = useState('synced');
  
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (squadId && user) {
      console.log('Fetching squad:', squadId);
      fetchSquadById(squadId).then(result => {
        console.log('Fetch squad result:', result);
      });
      // Join squad via global store
      joinSquad(squadId);
      
      // Join squad room via socket
      if (socket && isConnected && user) {
        console.log('Joining squad:', { squadId, user });
        socket.emit('join-squad', { squadId, user });
      }
    }
  }, [squadId, socket, isConnected, user, fetchSquadById, joinSquad]);

  useEffect(() => {
    // Socket event listeners
    if (socket) {
      socket.on('member-joined', (member) => {
        setMembers(prev => [...prev.filter(m => m.id !== member.id), member]);
        setChatMessages(prev => [...prev, {
          id: Date.now(),
          type: 'system',
          message: `${member.username} joined the squad`,
          timestamp: new Date()
        }]);
      });

      socket.on('member-left', (memberId) => {
        setMembers(prev => prev.filter(m => m.id !== memberId));
      });

      socket.on('video-sync', (data) => {
        if (data.action === 'play') {
          playVideo();
        } else if (data.action === 'pause') {
          pauseVideo();
        } else if (data.action === 'seek') {
          seekVideo(data.time);
        }
        setSyncStatus('synced');
      });

      socket.on('chat-message', (message) => {
        setChatMessages(prev => [...prev, message]);
      });

      socket.on('reaction', (reaction) => {
        setReactions(prev => [...prev, {
          id: Date.now(),
          emoji: reaction.emoji,
          x: Math.random() * 80 + 10,
          y: Math.random() * 80 + 10,
          userId: reaction.userId
        }]);
        
        // Remove reaction after animation
        setTimeout(() => {
          setReactions(prev => prev.filter(r => r.id !== reaction.id));
        }, 2000);
      });

      return () => {
        socket.off('member-joined');
        socket.off('member-left');
        socket.off('video-sync');
        socket.off('chat-message');
        socket.off('reaction');
      };
    }
  }, [socket]);

  // Keyboard shortcuts untuk demo
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Ctrl+Alt+C untuk ConnectionStatus demo
      if (event.ctrlKey && event.altKey && event.key === 'c') {
        event.preventDefault();
        launchConnectionStatusDemo();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleVideoAction = (action, data = {}) => {
    // Emit to other squad members
    if (socket && isConnected) {
      socket.emit('video-action', {
        squadId,
        action,
        ...data,
        userId: user?.id
      });
    }

    // Execute locally
    switch (action) {
      case 'play':
        playVideo();
        break;
      case 'pause':
        pauseVideo();
        break;
      case 'seek':
        seekVideo(data.time);
        break;
      default:
        break;
    }
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;

    const message = {
      id: Date.now(),
      type: 'user',
      message: chatMessage,
      user: user,
      timestamp: new Date()
    };

    // Add to local chat
    setChatMessages(prev => [...prev, message]);
    
    // Emit to other squad members
    if (socket && isConnected) {
      socket.emit('chat-message', { squadId, message });
    }

    setChatMessage('');
  };

  const handleReaction = (emoji) => {
    const reaction = {
      id: Date.now(),
      emoji,
      userId: user?.id,
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10
    };

    // Add to local reactions
    setReactions(prev => [...prev, reaction]);

    // Emit to other squad members
    if (socket && isConnected) {
      socket.emit('reaction', { squadId, reaction });
    }

    // Remove after animation
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== reaction.id));
    }, 2000);
  };

  const handleLoadVideo = async () => {
    if (!videoUrl.trim()) return;
    
    await loadVideo(videoUrl);
    setShowVideoUpload(false);
    setVideoUrl('');

    // Notify other squad members
    if (socket && isConnected) {
      socket.emit('video-loaded', { squadId, videoUrl, userId: user?.id });
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Loading state
  if (squadLoading) {
    return (
      <div className="min-h-screen bg-gray-950 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-100 mb-2">Loading Squad...</h2>
          <p className="text-gray-300">Getting everything ready for you</p>
        </div>
      </div>
    );
  }

  // Error state
  if (squadError) {
    return (
      <div className="min-h-screen bg-gray-950 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-100 mb-2">Something went wrong</h2>
          <p className="text-gray-300 mb-6">{squadError}</p>
          <div className="space-x-4">
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
            <Button onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Squad not found state
  if (!currentSquad) {
    return (
      <div className="min-h-screen bg-gray-950 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎬</div>
          <h2 className="text-2xl font-bold text-gray-100 mb-2">Squad not found</h2>
          <p className="text-gray-300 mb-6">This squad might not exist or you don't have access.</p>
          <Button onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-16">
      {/* Squad Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="text-gray-400 hover:text-white"
            >
              ← Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">{currentSquad.name}</h1>
              <p className="text-gray-400">{members.length} members watching</p>
            </div>
          </div>
          
          {/* Sync Status and Controls */}
          <div className="flex items-center space-x-4">
            {/* Drift Settings for Host */}
            <DriftSettings 
              isHost={members.find(m => m.id === user?.id)?.isHost || false} 
            />
            
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
              syncStatus === 'synced' 
                ? 'bg-green-900 text-green-300' 
                : 'bg-yellow-900 text-yellow-300'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                syncStatus === 'synced' ? 'bg-green-400' : 'bg-yellow-400'
              } animate-pulse`}></div>
              <span>{syncStatus === 'synced' ? 'In Sync' : 'Syncing...'}</span>
            </div>
            
            {/* Members */}
            <div className="flex -space-x-2">
              {members.slice(0, 5).map((member, index) => (
                <Avatar
                  key={member.id}
                  src={member.avatar}
                  alt={member.username}
                  size="sm"
                  className="border-2 border-gray-800"
                />
              ))}
              {members.length > 5 && (
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-xs text-gray-300 border-2 border-gray-800">
                  +{members.length - 5}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-140px)]">
        {/* Main Content - Video Player */}
        <div className="flex-1 flex flex-col">
          <div className="relative flex-1 bg-black">
            {/* Video Player Container */}
            <div className="relative w-full h-full">
              {currentVideo ? (
                <div className="relative w-full h-full">
                  {/* Video Element */}
                  <video
                    ref={videoPlayerRef}
                    className="w-full h-full object-contain"
                    src={currentVideo.url}
                    onTimeUpdate={(e) => {
                      // Sync time updates
                      const time = e.target.currentTime;
                      if (Math.abs(time - currentTime) > 2) {
                        setSyncStatus('syncing');
                        setTimeout(() => setSyncStatus('synced'), 1000);
                      }
                    }}
                  />

                  {/* Video Overlay - Reactions */}
                  <div className="reaction-overlay">
                    <AnimatePresence>
                      {reactions.map((reaction) => (
                        <motion.div
                          key={reaction.id}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1, y: -50 }}
                          exit={{ scale: 0, opacity: 0 }}
                          style={{
                            left: `${reaction.x}%`,
                            top: `${reaction.y}%`
                          }}
                          className="reaction-bubble"
                        >
                          {reaction.emoji}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Video Controls */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
                    {/* Drift Monitor - Top Right */}
                    <div className="absolute top-4 right-4">
                      <DriftMonitor 
                        enabled={isConnected && currentVideo} 
                        compact={true}
                        className="bg-black bg-opacity-50 text-white rounded-lg px-3 py-2"
                      />
                    </div>

                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        onClick={() => handleVideoAction(isPlaying ? 'pause' : 'play')}
                        className="text-white hover:bg-white hover:bg-opacity-20"
                      >
                        {isPlaying ? '⏸️' : '▶️'}
                      </Button>
                      
                      <div className="flex-1">
                        <input
                          type="range"
                          min="0"
                          max={duration || 100}
                          value={currentTime}
                          onChange={(e) => handleVideoAction('seek', { time: parseFloat(e.target.value) })}
                          className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      
                      <span className="text-white text-sm">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                      
                      <input
                        type="range"
                        min="0"
                        max="100"
                        defaultValue="50"
                        onChange={(e) => setVolume(parseFloat(e.target.value) / 100)}
                        className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-white">
                    <div className="text-6xl mb-4">🎬</div>
                    <h3 className="text-2xl font-bold mb-2">No video loaded</h3>
                    <p className="text-gray-400 mb-6">Upload a video or paste a link to start watching together</p>
                    <Button 
                      onClick={() => setShowVideoUpload(true)}
                      className="bg-squad-primary-600 hover:bg-squad-primary-700 text-white"
                    >
                      Add Video
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Reaction Bar */}
          <div className="bg-gray-800 px-6 py-3 border-t border-gray-700">
            <div className="flex items-center justify-center space-x-4">
              <span className="text-gray-400 text-sm">Quick Reactions:</span>
              {['😂', '❤️', '😮', '👏', '🔥', '😭', '💯', '🤩'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className="text-2xl hover:scale-125 transition-transform duration-200"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <motion.div 
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col"
          >
            {/* Chat Header */}
            <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-white font-semibold">Squad Chat</h3>
              <button
                onClick={() => setShowChat(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Chat Messages */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-3"
            >
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`chat-message ${msg.type}`}>
                  {msg.type === 'system' ? (
                    <div className="text-center text-gray-400 text-sm">
                      {msg.message}
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <Avatar src={msg.user?.avatar} size="sm" />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-white text-sm font-medium">
                            {msg.user?.username}
                          </span>
                          <span className="text-gray-400 text-xs">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm">{msg.message}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-700">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-squad-primary-500"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!chatMessage.trim()}
                  className="bg-squad-primary-600 hover:bg-squad-primary-700 text-white px-4"
                >
                  Send
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Chat Toggle Button */}
        {!showChat && (
          <button
            onClick={() => setShowChat(true)}
            className="fixed right-6 bottom-6 bg-squad-primary-600 hover:bg-squad-primary-700 text-white p-3 rounded-full shadow-lg z-10"
          >
            💬
          </button>
        )}
      </div>

      {/* Video Upload Modal */}
      <AnimatePresence>
        {showVideoUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">Add Video</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video URL
                  </label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://example.com/video.mp4 or Google Drive/Dropbox link"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-squad-primary-500"
                  />
                </div>
                
                <div className="text-sm text-gray-600">
                  <p className="mb-2">Supported sources:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Direct video links (.mp4, .webm, .ogg)</li>
                    <li>Google Drive shareable links</li>
                    <li>Dropbox direct links</li>
                    <li>YouTube links (coming soon)</li>
                  </ul>
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <Button
                  onClick={handleLoadVideo}
                  disabled={!videoUrl.trim() || isLoading}
                  className="flex-1 bg-squad-primary-600 hover:bg-squad-primary-700 text-white"
                >
                  {isLoading ? 'Loading...' : 'Load Video'}
                </Button>
                <Button
                  onClick={() => {
                    setShowVideoUpload(false);
                    setVideoUrl('');
                  }}
                  variant="secondary"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WebWorker Debug Monitor */}
      <WebWorkerDebugMonitor />

      {/* Connection Status */}
      <ConnectionStatus 
        position="top-left"
        showDetails={true}
        autoHide={false}
      />
    </div>
  );
};

export default Squad;
