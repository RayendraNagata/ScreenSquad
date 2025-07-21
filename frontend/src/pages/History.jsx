import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { Card, LoadingSpinner } from '../components/ui/index.jsx';
import Button from '../components/ui/Button';

const History = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, videos, squads, activities
  const [sortBy, setSortBy] = useState('recent'); // recent, duration, squad

  // Dummy data for now - will be replaced with real API calls
  const [historyData, setHistoryData] = useState({
    videos: [
      {
        id: 1,
        title: "Avengers: Endgame",
        thumbnail: "https://picsum.photos/400/225?random=1",
        duration: "181 minutes",
        watchedAt: "2 hours ago",
        squadName: "Marvel Squad",
        progress: 85,
        type: 'video'
      },
      {
        id: 2,
        title: "The Office S01E01",
        thumbnail: "https://picsum.photos/400/225?random=2",
        duration: "22 minutes",
        watchedAt: "1 day ago",
        squadName: "Comedy Squad",
        progress: 100,
        type: 'video'
      },
      {
        id: 3,
        title: "Study Together Session",
        thumbnail: "https://picsum.photos/400/225?random=3",
        duration: "3 hours",
        watchedAt: "3 days ago",
        squadName: "Study Group",
        progress: 65,
        type: 'video'
      }
    ],
    squads: [
      {
        id: 1,
        name: "Marvel Squad",
        lastActivity: "2 hours ago",
        totalTime: "45 hours",
        videosWatched: 12,
        type: 'squad'
      },
      {
        id: 2,
        name: "Comedy Squad",
        lastActivity: "1 day ago",
        totalTime: "23 hours",
        videosWatched: 8,
        type: 'squad'
      }
    ],
    activities: [
      {
        id: 1,
        action: "Joined Marvel Squad",
        time: "2 hours ago",
        type: 'activity'
      },
      {
        id: 2,
        action: "Completed watching Avengers: Endgame",
        time: "2 hours ago",
        type: 'activity'
      },
      {
        id: 3,
        action: "Created new squad: Study Group",
        time: "1 week ago",
        type: 'activity'
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

  // Filter and sort data
  const getFilteredData = () => {
    let data = [];
    
    if (filter === 'all') {
      data = [
        ...historyData.videos,
        ...historyData.squads,
        ...historyData.activities
      ];
    } else if (filter === 'videos') {
      data = historyData.videos;
    } else if (filter === 'squads') {
      data = historyData.squads;
    } else if (filter === 'activities') {
      data = historyData.activities;
    }

    // Sort data based on sortBy
    if (sortBy === 'recent') {
      data.sort((a, b) => new Date(b.watchedAt || b.lastActivity || b.time) - new Date(a.watchedAt || a.lastActivity || a.time));
    }
    
    return data;
  };

  const filteredData = getFilteredData();

  // Stats
  const stats = {
    totalVideos: historyData.videos.length,
    totalSquads: historyData.squads.length,
    totalWatchTime: historyData.squads.reduce((acc, squad) => {
      const hours = parseInt(squad.totalTime.split(' ')[0]);
      return acc + hours;
    }, 0),
    thisWeek: 3 // dummy data
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center pt-20">
        <div className="text-center">
          <LoadingSpinner size="xl" />
          <p className="mt-4 text-gray-300">Loading your history...</p>
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
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                Watch History
              </h1>
              <p className="text-xl text-gray-300">
                Track your viewing journey and squad activities
              </p>
            </div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                onClick={() => navigate('/dashboard')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-lg"
              >
                Back to Dashboard
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-500 mb-2">{stats.totalVideos}</div>
            <div className="text-gray-300">Videos Watched</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-green-500 mb-2">{stats.totalSquads}</div>
            <div className="text-gray-300">Squads Joined</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-500 mb-2">{stats.totalWatchTime}h</div>
            <div className="text-gray-300">Total Watch Time</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-orange-500 mb-2">{stats.thisWeek}</div>
            <div className="text-gray-300">This Week</div>
          </Card>
        </motion.div>

        {/* Filter and Sort Controls */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            {/* Filter Tabs */}
            <div className="flex space-x-2">
              {[
                { key: 'all', label: 'All Activity' },
                { key: 'videos', label: 'Videos' },
                { key: 'squads', label: 'Squads' },
                { key: 'activities', label: 'Activities' }
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

            {/* Sort Controls */}
            <div className="flex items-center space-x-2">
              <span className="text-gray-300 text-sm">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="recent">Most Recent</option>
                <option value="duration">Duration</option>
                <option value="squad">Squad Name</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* History List */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {filteredData.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="text-6xl mb-4">📺</div>
              <h3 className="text-xl font-bold text-gray-100 mb-2">No history yet</h3>
              <p className="text-gray-300 mb-6">
                Start watching videos with squads to build your history!
              </p>
              <Button 
                onClick={() => navigate('/dashboard')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Start Watching
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredData.map((item, index) => (
                <motion.div
                  key={`${item.type}-${item.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Card className="p-6 hover:shadow-xl transition-all duration-300">
                    {item.type === 'video' && (
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="w-24 h-14 object-cover rounded-lg"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-100 truncate">
                            {item.title}
                          </h3>
                          <p className="text-gray-300 text-sm">
                            Watched in <span className="font-medium">{item.squadName}</span>
                          </p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-sm text-gray-400">{item.duration}</span>
                            <span className="text-sm text-gray-400">{item.watchedAt}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-gray-700 rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full" 
                                  style={{ width: `${item.progress}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-400">{item.progress}%</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <Button
                            onClick={() => navigate('/dashboard')}
                            variant="outline"
                            size="sm"
                          >
                            Watch Again
                          </Button>
                        </div>
                      </div>
                    )}

                    {item.type === 'squad' && (
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-100">
                            {item.name}
                          </h3>
                          <p className="text-gray-300 text-sm">
                            {item.videosWatched} videos watched • {item.totalTime} total
                          </p>
                          <span className="text-sm text-gray-400">{item.lastActivity}</span>
                        </div>
                        <div className="flex-shrink-0">
                          <Button
                            onClick={() => navigate('/my-squads')}
                            variant="outline"
                            size="sm"
                          >
                            View Squad
                          </Button>
                        </div>
                      </div>
                    )}

                    {item.type === 'activity' && (
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-100">
                            {item.action}
                          </h3>
                          <span className="text-sm text-gray-400">{item.time}</span>
                        </div>
                        <div className="text-2xl">🎬</div>
                      </div>
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

export default History;
