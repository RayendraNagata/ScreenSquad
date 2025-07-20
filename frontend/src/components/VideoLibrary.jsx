import React, { useState } from 'react';
import { useVideoControl, useUserRole, usePlaybackState } from '../hooks/useGlobalStore';
import { Plus, Search, Play, Clock, Star, Trash2 } from 'lucide-react';

/**
 * Video Library using Global Store
 * Browse and select videos with role-based access
 */
const VideoLibrary = () => {
  const { setVideo, currentVideo } = useVideoControl();
  const { canChangeVideo, userRole } = useUserRole();
  const { isPlaying } = usePlaybackState();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVideo, setNewVideo] = useState({
    title: '',
    url: '',
    thumbnail: '',
    metadata: { genre: '', year: '' }
  });

  // Sample video library
  const [videoLibrary, setVideoLibrary] = useState([
    {
      id: 'video-1',
      title: 'Big Buck Bunny',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
      duration: 596,
      metadata: { genre: 'Animation', year: 2008, rating: 4.5 }
    },
    {
      id: 'video-2',
      title: 'Elephant Dream',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
      duration: 653,
      metadata: { genre: 'Animation', year: 2006, rating: 4.2 }
    },
    {
      id: 'video-3',
      title: 'For Bigger Blazes',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg',
      duration: 15,
      metadata: { genre: 'Demo', year: 2017, rating: 3.8 }
    },
    {
      id: 'video-4',
      title: 'Sintel',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg',
      duration: 888,
      metadata: { genre: 'Drama', year: 2010, rating: 4.7 }
    }
  ]);

  const categories = ['all', 'Animation', 'Drama', 'Demo'];

  // Filter videos
  const filteredVideos = videoLibrary.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.metadata.genre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || video.metadata.genre === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Format duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle video selection
  const handleVideoSelect = (video) => {
    if (!canChangeVideo) {
      alert('You don\'t have permission to change videos');
      return;
    }
    
    setVideo(video);
  };

  // Handle add new video
  const handleAddVideo = () => {
    if (!canChangeVideo) {
      alert('You don\'t have permission to add videos');
      return;
    }

    if (!newVideo.title || !newVideo.url) {
      alert('Please fill in required fields');
      return;
    }

    const video = {
      id: `video-${Date.now()}`,
      ...newVideo,
      duration: 0, // Will be set when video loads
      metadata: {
        ...newVideo.metadata,
        year: parseInt(newVideo.metadata.year) || new Date().getFullYear(),
        rating: 0
      }
    };

    setVideoLibrary(prev => [...prev, video]);
    setNewVideo({ title: '', url: '', thumbnail: '', metadata: { genre: '', year: '' } });
    setShowAddForm(false);
  };

  // Handle remove video
  const handleRemoveVideo = (videoId) => {
    if (userRole !== 'host') {
      alert('Only hosts can remove videos');
      return;
    }

    if (confirm('Are you sure you want to remove this video?')) {
      setVideoLibrary(prev => prev.filter(v => v.id !== videoId));
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Video Library</h3>
        {canChangeVideo && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Video</span>
          </button>
        )}
      </div>

      {/* Add Video Form */}
      {showAddForm && (
        <div className="bg-gray-900 rounded-lg p-4 space-y-4">
          <h4 className="text-white font-medium">Add New Video</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Video Title *"
              value={newVideo.title}
              onChange={(e) => setNewVideo(prev => ({ ...prev, title: e.target.value }))}
              className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
            <input
              type="url"
              placeholder="Video URL *"
              value={newVideo.url}
              onChange={(e) => setNewVideo(prev => ({ ...prev, url: e.target.value }))}
              className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
            <input
              type="url"
              placeholder="Thumbnail URL"
              value={newVideo.thumbnail}
              onChange={(e) => setNewVideo(prev => ({ ...prev, thumbnail: e.target.value }))}
              className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
            <input
              type="text"
              placeholder="Genre"
              value={newVideo.metadata.genre}
              onChange={(e) => setNewVideo(prev => ({ 
                ...prev, 
                metadata: { ...prev.metadata, genre: e.target.value }
              }))}
              className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleAddVideo}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Add Video
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search videos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Permission Notice */}
      {!canChangeVideo && (
        <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-3">
          <div className="text-yellow-400 text-sm">
            Only hosts and moderators can change videos. You can browse the library but cannot select videos.
          </div>
        </div>
      )}

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVideos.map(video => (
          <div
            key={video.id}
            className={`bg-gray-900 rounded-lg overflow-hidden transition-all hover:bg-gray-850 ${
              currentVideo?.id === video.id ? 'ring-2 ring-purple-500' : ''
            }`}
          >
            {/* Thumbnail */}
            <div className="relative aspect-video bg-gray-700">
              {video.thumbnail ? (
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Play className="w-12 h-12 text-gray-500" />
                </div>
              )}
              
              {/* Duration Badge */}
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                <Clock className="w-3 h-3 inline mr-1" />
                {formatDuration(video.duration)}
              </div>

              {/* Currently Playing Badge */}
              {currentVideo?.id === video.id && isPlaying && (
                <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span>Playing</span>
                </div>
              )}
            </div>

            {/* Video Info */}
            <div className="p-4">
              <h4 className="text-white font-medium mb-2 line-clamp-2">
                {video.title}
              </h4>
              
              <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                <span>{video.metadata.genre}</span>
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 text-yellow-400" />
                  <span>{video.metadata.rating}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleVideoSelect(video)}
                  disabled={!canChangeVideo}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    canChangeVideo
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Play className="w-4 h-4" />
                  <span>
                    {currentVideo?.id === video.id ? 'Playing' : 'Play'}
                  </span>
                </button>

                {userRole === 'host' && (
                  <button
                    onClick={() => handleRemoveVideo(video.id)}
                    className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredVideos.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <div className="text-lg mb-2">No videos found</div>
          <div className="text-sm">
            {searchTerm ? 'Try a different search term' : 'No videos in this category'}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoLibrary;
