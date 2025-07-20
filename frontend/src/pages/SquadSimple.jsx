import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useSquadStore from '../store/squadStore_fixed';
import Button from '../components/ui/Button';
import VideoPlayer from '../components/video/VideoPlayer';
import VideoManager from '../components/video/VideoManager';
import WatchChat from '../components/chat/WatchChat';

const SquadSimple = () => {
  const { squadId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { currentSquad, fetchSquadById, isLoading, error } = useSquadStore();
  const [loadAttempts, setLoadAttempts] = useState(0);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [syncTime, setSyncTime] = useState(0);
  const [showVideoManager, setShowVideoManager] = useState(false);
  
  // Check if current user is host
  const isHost = currentSquad?.members?.some(m => 
    (m.username === user?.username || m.username === 'You') && m.isHost
  );

  useEffect(() => {
    console.log('SquadSimple mounted with squadId:', squadId);
    
    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting to home');
      navigate('/', { replace: true });
      return;
    }

    if (squadId && user) {
      console.log('Attempting to fetch squad:', squadId);
      setLoadAttempts(prev => prev + 1);
      
      fetchSquadById(squadId)
        .then(result => {
          console.log('Squad fetch result:', result);
        })
        .catch(err => {
          console.error('Squad fetch error:', err);
        });
    }
  }, [squadId, user, isAuthenticated, navigate, fetchSquadById]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white mb-2">Loading Squad...</h2>
          <p className="text-gray-400">Attempt {loadAttempts}</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !currentSquad) {
    return (
      <div className="min-h-screen bg-gray-900 pt-16 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Squad Not Found</h2>
          <p className="text-gray-400 mb-6">
            Squad with ID "{squadId}" could not be found or you don't have access to it.
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => fetchSquadById(squadId)}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Retry Loading
            </Button>
            <Button
              onClick={() => navigate('/dashboard')}
              variant="secondary"
              className="w-full"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show the squad
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
              <p className="text-gray-400">{currentSquad.members?.length || 0} members</p>
            </div>
          </div>
        </div>
      </div>

      {/* Squad Content */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
        {showVideoManager && isHost ? (
          /* Video Manager Full Screen Layout */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video Player Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Video Section */}
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white">Squad Theater</h2>
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => setShowVideoManager(false)}
                      variant="outline"
                      size="sm"
                      className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Close Manager
                    </Button>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      isHost ? 'bg-blue-600 text-white' : 'bg-gray-600 text-white'
                    }`}>
                      {isHost ? 'HOST' : 'MEMBER'}
                    </div>
                  </div>
                </div>
                
                <VideoPlayer
                  videoUrl={currentVideo?.url}
                  isHost={isHost}
                  onTimeUpdate={setSyncTime}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  syncTime={syncTime}
                  isPlaying={isPlaying}
                />
                
                {/* Debug Info */}
                {currentVideo && (
                  <div className="mt-2 p-2 bg-gray-700 rounded text-xs text-gray-300">
                    <p>Current Video: {currentVideo.title}</p>
                    <p>URL: {currentVideo.url}</p>
                    <p>Type: {currentVideo.type}</p>
                  </div>
                )}
                
                {!currentVideo && (
                  <div className="mt-4 text-center">
                    <p className="text-gray-400 mb-4">
                      Select a video from the library to start watching together!
                    </p>
                  </div>
                )}
              </div>
              
              {/* Squad Info */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">Squad Information</h2>
                <div className="space-y-4">
                  <div>
                    <span className="text-gray-400">Name:</span>
                    <span className="text-white ml-2">{currentSquad.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Description:</span>
                    <span className="text-white ml-2">{currentSquad.description || 'No description'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Created:</span>
                    <span className="text-white ml-2">
                      {new Date(currentSquad.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Status:</span>
                    <span className={`ml-2 ${currentSquad.isActive ? 'text-green-400' : 'text-gray-400'}`}>
                      {currentSquad.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Manager Section */}
            <div className="space-y-4 max-h-screen overflow-y-auto">
              <VideoManager
                isHost={isHost}
                onVideoSelect={(video) => {
                  console.log('SquadSimple: Video selected:', video);
                  setCurrentVideo(video);
                  setIsPlaying(false);
                  setSyncTime(0);
                }}
                currentVideo={currentVideo}
              />
              
              {/* Members */}
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Members</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                    <span>{currentSquad.members?.length || 0} Members</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {currentSquad.members?.map((member) => (
                    <div key={member.id} className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-sm text-white font-medium">
                          {member.username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <span className="text-white font-medium">{member.username}</span>
                        {member.isHost && (
                          <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                            HOST
                          </span>
                        )}
                      </div>
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" title="Online" />
                    </div>
                  )) || (
                    <p className="text-gray-400">No members</p>
                  )}
                </div>
              </div>

              {/* Chat */}
              <WatchChat
                squadId={squadId}
                user={user}
                isActive={true}
              />
            </div>
          </div>
        ) : (
          /* Normal Layout without Video Manager */
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="xl:col-span-3">
              <div className="bg-gray-800 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-bold text-white mb-4">Squad Information</h2>
                <div className="space-y-4">
                  <div>
                    <span className="text-gray-400">Name:</span>
                    <span className="text-white ml-2">{currentSquad.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Description:</span>
                    <span className="text-white ml-2">{currentSquad.description || 'No description'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Created:</span>
                    <span className="text-white ml-2">
                      {new Date(currentSquad.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Status:</span>
                    <span className={`ml-2 ${currentSquad.isActive ? 'text-green-400' : 'text-gray-400'}`}>
                      {currentSquad.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Video Section */}
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white">Squad Theater</h2>
                  <div className="flex space-x-3">
                    {isHost && (
                      <Button
                        onClick={() => setShowVideoManager(true)}
                        variant="outline"
                        size="sm"
                        className="text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-white flex items-center"
                      >
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2l4.5 3-4.5 3V5z" clipRule="evenodd" />
                        </svg>
                        Manage Videos
                      </Button>
                    )}
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      isHost ? 'bg-blue-600 text-white' : 'bg-gray-600 text-white'
                    }`}>
                      {isHost ? 'HOST' : 'MEMBER'}
                    </div>
                  </div>
                </div>
                
                <VideoPlayer
                  videoUrl={currentVideo?.url}
                  isHost={isHost}
                  onTimeUpdate={setSyncTime}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  syncTime={syncTime}
                  isPlaying={isPlaying}
                />
                
                {/* Debug Info */}
                {currentVideo && (
                  <div className="mt-2 p-2 bg-gray-700 rounded text-xs text-gray-300">
                    <p>Current Video: {currentVideo.title}</p>
                    <p>URL: {currentVideo.url}</p>
                    <p>Type: {currentVideo.type}</p>
                  </div>
                )}
                
                {!currentVideo && (
                  <div className="mt-4 text-center">
                    <p className="text-gray-400 mb-4">
                      {isHost ? 'Select a video from the library to start watching together!' : 'Waiting for host to start a video...'}
                    </p>
                    {isHost && (
                      <Button
                        onClick={() => setShowVideoManager(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white flex items-center mx-auto"
                      >
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                        </svg>
                        Open Video Library
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Members */}
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Members</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                    <span>{currentSquad.members?.length || 0} Members</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {currentSquad.members?.map((member) => (
                    <div key={member.id} className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-sm text-white font-medium">
                          {member.username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <span className="text-white font-medium">{member.username}</span>
                        {member.isHost && (
                          <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                            HOST
                          </span>
                        )}
                      </div>
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" title="Online" />
                    </div>
                  )) || (
                    <p className="text-gray-400">No members</p>
                  )}
                </div>
              </div>

              {/* Chat */}
              <WatchChat
                squadId={squadId}
                user={user}
                isActive={true}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SquadSimple;
