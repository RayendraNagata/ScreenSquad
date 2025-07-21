import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { Card, LoadingSpinner } from '../components/ui/index.jsx';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Browse = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, squads, videos, users
  const [category, setCategory] = useState('all'); // all, movies, tv-shows, anime, gaming, education

  // Dummy data for browse content
  const [browseData, setBrowseData] = useState({
    squads: [
      {
        id: 1,
        name: 'Marvel Movie Marathon',
        description: 'Watch all Marvel movies in chronological order',
        members: 24,
        isPublic: true,
        category: 'movies',
        thumbnail: 'https://picsum.photos/400/225?random=1',
        tags: ['Marvel', 'Movies', 'Action'],
        host: 'CaptainMovies',
        isActive: true
      },
      {
        id: 2,
        name: 'Anime Lovers United',
        description: 'Discovering the best anime series together',
        members: 18,
        isPublic: true,
        category: 'anime',
        thumbnail: 'https://picsum.photos/400/225?random=2',
        tags: ['Anime', 'Japanese', 'Series'],
        host: 'AnimeGuru',
        isActive: true
      },
      {
        id: 3,
        name: 'Gaming Streams & Reviews',
        description: 'Watch gaming content and discuss strategies',
        members: 31,
        isPublic: true,
        category: 'gaming',
        thumbnail: 'https://picsum.photos/400/225?random=3',
        tags: ['Gaming', 'Streams', 'Reviews'],
        host: 'GameMaster99',
        isActive: false
      },
      {
        id: 4,
        name: 'Study Together',
        description: 'Educational content and study sessions',
        members: 12,
        isPublic: true,
        category: 'education',
        thumbnail: 'https://picsum.photos/400/225?random=4',
        tags: ['Study', 'Education', 'Focus'],
        host: 'StudyBuddy',
        isActive: true
      }
    ],
    videos: [
      {
        id: 1,
        title: 'The Avengers',
        description: 'Earth\'s Mightiest Heroes must come together...',
        duration: '143 minutes',
        category: 'movies',
        thumbnail: 'https://picsum.photos/400/225?random=5',
        rating: 4.8,
        views: 1234,
        tags: ['Action', 'Adventure', 'Superhero']
      },
      {
        id: 2,
        title: 'Attack on Titan S1E1',
        description: 'The beginning of humanity\'s fight for survival',
        duration: '24 minutes',
        category: 'anime',
        thumbnail: 'https://picsum.photos/400/225?random=6',
        rating: 4.9,
        views: 2341,
        tags: ['Anime', 'Action', 'Drama']
      }
    ],
    users: [
      {
        id: 1,
        username: 'MovieBuff92',
        avatar: 'https://picsum.photos/64/64?random=10',
        squadsHosted: 3,
        followers: 156,
        bio: 'Love discovering hidden gems in cinema',
        isOnline: true
      },
      {
        id: 2,
        username: 'AnimeExpert',
        avatar: 'https://picsum.photos/64/64?random=11',
        squadsHosted: 2,
        followers: 89,
        bio: 'Anime enthusiast and Japanese culture lover',
        isOnline: false
      }
    ]
  });

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Filter and search logic
  const getFilteredResults = () => {
    let results = [];
    
    if (filter === 'all') {
      results = [
        ...browseData.squads.map(item => ({ ...item, type: 'squad' })),
        ...browseData.videos.map(item => ({ ...item, type: 'video' })),
        ...browseData.users.map(item => ({ ...item, type: 'user' }))
      ];
    } else if (filter === 'squads') {
      results = browseData.squads.map(item => ({ ...item, type: 'squad' }));
    } else if (filter === 'videos') {
      results = browseData.videos.map(item => ({ ...item, type: 'video' }));
    } else if (filter === 'users') {
      results = browseData.users.map(item => ({ ...item, type: 'user' }));
    }

    // Apply category filter
    if (category !== 'all') {
      results = results.filter(item => item.category === category);
    }

    // Apply search filter
    if (searchQuery) {
      results = results.filter(item => 
        (item.name || item.title || item.username)?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return results;
  };

  const filteredResults = getFilteredResults();

  // Stats
  const stats = {
    totalSquads: browseData.squads.length,
    activeSquads: browseData.squads.filter(s => s.isActive).length,
    totalVideos: browseData.videos.length,
    totalUsers: browseData.users.length
  };

  const joinSquad = (squadId) => {
    // TODO: Implement join squad functionality
    console.log('Joining squad:', squadId);
    navigate(`/squad/${squadId}`);
  };

  const followUser = (userId) => {
    // TODO: Implement follow user functionality
    console.log('Following user:', userId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center pt-20">
        <div className="text-center">
          <LoadingSpinner size="xl" />
          <p className="mt-4 text-gray-300">Loading browse content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-100 mb-2 flex items-center">
                <svg className="w-10 h-10 mr-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
                Browse
              </h1>
              <p className="text-xl text-gray-300">
                Discover new squads, videos, and creators
              </p>
            </div>
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative max-w-2xl">
            <Input
              type="text"
              placeholder="Search squads, videos, or users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 text-lg"
            />
            <svg 
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-500 mb-2">{stats.totalSquads}</div>
            <div className="text-gray-300">Public Squads</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-green-500 mb-2">{stats.activeSquads}</div>
            <div className="text-gray-300">Active Now</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-500 mb-2">{stats.totalVideos}</div>
            <div className="text-gray-300">Featured Videos</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-orange-500 mb-2">{stats.totalUsers}</div>
            <div className="text-gray-300">Active Creators</div>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Content Type Filter */}
            <div className="flex space-x-2">
              <span className="text-gray-300 text-sm flex items-center">Type:</span>
              {[
                { key: 'all', label: 'All' },
                { key: 'squads', label: 'Squads' },
                { key: 'videos', label: 'Videos' },
                { key: 'users', label: 'Users' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === tab.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Category Filter */}
            <div className="flex space-x-2">
              <span className="text-gray-300 text-sm flex items-center">Category:</span>
              {[
                { key: 'all', label: 'All' },
                { key: 'movies', label: 'Movies' },
                { key: 'tv-shows', label: 'TV Shows' },
                { key: 'anime', label: 'Anime' },
                { key: 'gaming', label: 'Gaming' },
                { key: 'education', label: 'Education' }
              ].map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setCategory(cat.key)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    category === cat.key
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Results */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {filteredResults.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-100 mb-2">No results found</h3>
              <p className="text-gray-300 mb-6">
                Try adjusting your search or filters to find what you're looking for.
              </p>
              <Button 
                onClick={() => {
                  setSearchQuery('');
                  setFilter('all');
                  setCategory('all');
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Clear Filters
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResults.map((item, index) => (
                <motion.div
                  key={`${item.type}-${item.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Card className="p-6 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                    {item.type === 'squad' && (
                      <>
                        <div className="relative mb-4">
                          <img
                            src={item.thumbnail}
                            alt={item.name}
                            className="w-full h-40 object-cover rounded-lg"
                          />
                          {item.isActive && (
                            <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                              Live
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-100 mb-2">
                            {item.name}
                          </h3>
                          <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                            {item.description}
                          </p>
                          <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                            <span>👥 {item.members} members</span>
                            <span>Host: {item.host}</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mb-4">
                            {item.tags.map((tag, i) => (
                              <span key={i} className="bg-gray-700 text-gray-300 px-2 py-1 rounded-full text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <Button
                          onClick={() => joinSquad(item.id)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Join Squad
                        </Button>
                      </>
                    )}

                    {item.type === 'video' && (
                      <>
                        <div className="relative mb-4">
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="w-full h-40 object-cover rounded-lg"
                          />
                          <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                            {item.duration}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-100 mb-2">
                            {item.title}
                          </h3>
                          <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                            {item.description}
                          </p>
                          <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                            <span>⭐ {item.rating}/5</span>
                            <span>👀 {item.views} views</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mb-4">
                            {item.tags.map((tag, i) => (
                              <span key={i} className="bg-gray-700 text-gray-300 px-2 py-1 rounded-full text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <Button
                          onClick={() => navigate('/dashboard')}
                          variant="outline"
                          className="w-full"
                        >
                          Watch Now
                        </Button>
                      </>
                    )}

                    {item.type === 'user' && (
                      <>
                        <div className="flex items-center mb-4">
                          <img
                            src={item.avatar}
                            alt={item.username}
                            className="w-16 h-16 rounded-full mr-4"
                          />
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-100 flex items-center">
                              {item.username}
                              {item.isOnline && (
                                <span className="ml-2 w-3 h-3 bg-green-500 rounded-full"></span>
                              )}
                            </h3>
                            <p className="text-gray-400 text-sm">
                              {item.followers} followers
                            </p>
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-300 text-sm mb-3">
                            {item.bio}
                          </p>
                          <p className="text-gray-400 text-sm mb-4">
                            Hosting {item.squadsHosted} squad{item.squadsHosted !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <Button
                          onClick={() => followUser(item.id)}
                          variant="outline"
                          className="w-full"
                        >
                          Follow
                        </Button>
                      </>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Browse;
