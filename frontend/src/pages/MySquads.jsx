import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useSquadStore from '../store/squadStore_fixed';
import { Card, LoadingSpinner } from '../components/ui/index.jsx';
import Button from '../components/ui/Button';

const MySquads = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { squads, isLoading, fetchSquads } = useSquadStore();
  const [filter, setFilter] = useState('all'); // all, active, inactive

  useEffect(() => {
    fetchSquads();
  }, []); // Remove fetchSquads from dependencies to prevent infinite loops

  // Filter squads based on selected filter
  const filteredSquads = squads.filter(squad => {
    if (filter === 'active') return squad.isActive;
    if (filter === 'inactive') return !squad.isActive;
    return true; // 'all'
  });

  // Get stats
  const stats = {
    total: squads.length,
    active: squads.filter(s => s.isActive).length,
    inactive: squads.filter(s => !s.isActive).length,
    isHost: squads.filter(s => s.members?.some(m => m.username === 'You' && m.isHost)).length
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center pt-20">
        <div className="text-center">
          <LoadingSpinner size="xl" />
          <p className="mt-4 text-gray-300">Loading your squads...</p>
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
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2l4.5 3-4.5 3V5z" clipRule="evenodd" />
                </svg>
                My Squads
              </h1>
              <p className="text-xl text-gray-300">
                Manage all your squads in one place
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
            <div className="text-3xl font-bold text-blue-500 mb-2">{stats.total}</div>
            <div className="text-gray-300">Total Squads</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-green-500 mb-2">{stats.active}</div>
            <div className="text-gray-300">Active Now</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-gray-400 mb-2">{stats.inactive}</div>
            <div className="text-gray-300">Inactive</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-500 mb-2">{stats.isHost}</div>
            <div className="text-gray-300">You're Host</div>
          </Card>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex space-x-4">
            {[
              { key: 'all', label: 'All Squads', count: stats.total },
              { key: 'active', label: 'Active', count: stats.active },
              { key: 'inactive', label: 'Inactive', count: stats.inactive }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  filter === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </motion.div>

        {/* Squads Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {filteredSquads.length === 0 ? (
            <Card className="p-12 text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2l4.5 3-4.5 3V5z" clipRule="evenodd" />
              </svg>
              <h3 className="text-xl font-bold text-gray-100 mb-2">
                {filter === 'all' ? 'No squads yet' : `No ${filter} squads`}
              </h3>
              <p className="text-gray-300 mb-6">
                {filter === 'all' 
                  ? 'Create your first squad to start watching together!'
                  : `You don't have any ${filter} squads at the moment.`
                }
              </p>
              {filter === 'all' && (
                <Button 
                  onClick={() => navigate('/dashboard')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Create New Squad
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSquads.map((squad, index) => (
                <motion.div
                  key={squad.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.02 }}
                  className="cursor-pointer"
                  onClick={() => navigate(`/squad/${squad.id}`)}
                >
                  <Card className="squad-card group hover:shadow-xl transition-all duration-300">
                    {/* Squad Header */}
                    <div className="p-6 border-b border-gray-700">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-100 mb-2 group-hover:text-blue-400 transition-colors">
                            {squad.name}
                          </h3>
                          <p className="text-sm text-gray-300 mb-3">
                            {squad.description || 'No description'}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <span>👥 {squad.members?.length || 0} members</span>
                            <span>📅 {new Date(squad.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          {/* Status Badge */}
                          <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${
                            squad.isActive 
                              ? 'bg-green-900 text-green-300' 
                              : 'bg-gray-700 text-gray-300'
                          }`}>
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                              squad.isActive ? 'bg-green-400' : 'bg-gray-400'
                            }`} />
                            {squad.isActive ? 'Active' : 'Inactive'}
                          </div>
                          
                          {/* Host Badge */}
                          {squad.members?.some(m => m.username === 'You' && m.isHost) && (
                            <div className="px-3 py-1 rounded-full text-xs font-medium bg-blue-900 text-blue-300 flex items-center">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a3 3 0 01-3-3V6z" clipRule="evenodd" />
                              </svg>
                              Host
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Members Section */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-100">Members</h4>
                        <span className="text-sm text-gray-400">
                          {squad.isActive ? squad.lastSeen : `Last active: ${squad.lastSeen}`}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="flex -space-x-2">
                          {squad.members?.slice(0, 5).map((member, i) => (
                            <div 
                              key={member.id}
                              className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium border-2 border-gray-800"
                              title={member.username}
                            >
                              {member.username.charAt(0).toUpperCase()}
                            </div>
                          ))}
                          {squad.members?.length > 5 && (
                            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-xs font-semibold text-gray-300 border-2 border-gray-800">
                              +{squad.members.length - 5}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Last Activity */}
                      <div className="text-sm text-gray-300 mb-4">
                        <span className="font-medium">Last activity:</span> {squad.lastActivity}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-3">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/squad/${squad.id}`);
                          }}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2"
                        >
                          📺 Join Squad
                        </Button>
                        {squad.members?.some(m => m.username === 'You' && m.isHost) && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: Add manage squad functionality
                              console.log('Manage squad:', squad.id);
                            }}
                            variant="outline"
                            className="px-4 py-2 text-sm"
                          >
                            ⚙️
                          </Button>
                        )}
                      </div>
                    </div>
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

export default MySquads;
