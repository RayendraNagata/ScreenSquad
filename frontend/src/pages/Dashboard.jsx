import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useSquadStore from '../store/squadStore';
import { Card, Modal, LoadingSpinner } from '../components/ui/index.jsx';
import Button from '../components/ui/Button';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { squads, isLoading, fetchSquads, createSquad } = useSquadStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [squadName, setSquadName] = useState('');

  useEffect(() => {
    fetchSquads();
  }, [fetchSquads]);

  const handleCreateSquad = async () => {
    if (!squadName.trim()) return;
    
    await createSquad(squadName);
    setSquadName('');
    setShowCreateModal(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" />
          <p className="mt-4 text-gray-600">Loading your squads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.username}! 👋
              </h1>
              <p className="text-xl text-gray-600">
                Ready to watch together with your squads?
              </p>
            </div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="bg-squad-primary-600 hover:bg-squad-primary-700 text-white px-6 py-3 text-lg"
              >
                + Create New Squad
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
        >
          <Card className="bg-gradient-to-r from-squad-primary-500 to-squad-primary-600 text-white">
            <div className="text-center">
              <div className="text-3xl font-bold">{squads.length}</div>
              <div className="text-blue-100">Your Squads</div>
            </div>
          </Card>
          <Card className="bg-gradient-to-r from-squad-secondary-500 to-squad-secondary-600 text-white">
            <div className="text-center">
              <div className="text-3xl font-bold">24</div>
              <div className="text-green-100">Movies Watched</div>
            </div>
          </Card>
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <div className="text-center">
              <div className="text-3xl font-bold">156</div>
              <div className="text-purple-100">Hours Together</div>
            </div>
          </Card>
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <div className="text-center">
              <div className="text-3xl font-bold">89</div>
              <div className="text-orange-100">Reactions Sent</div>
            </div>
          </Card>
        </motion.div>

        {/* Squads Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Squads</h2>
          
          {squads.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="text-6xl mb-4">🎬</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No squads yet!</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Create your first squad and start watching movies together with friends. 
                It's more fun when you're not alone!
              </p>
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="bg-squad-primary-600 hover:bg-squad-primary-700 text-white px-8 py-3 text-lg"
              >
                Create Your First Squad
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {squads.map((squad, index) => (
                <motion.div
                  key={squad.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ y: -5 }}
                >
                  <Card 
                    className="squad-card cursor-pointer h-full" 
                    onClick={() => navigate(`/squad/${squad.id}`)}
                  >
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-squad-primary-600 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                        {squad.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{squad.name}</h3>
                        <p className="text-sm text-gray-600">{squad.members?.length || 1} members</p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="text-sm text-gray-600 mb-2">Recent Activity</div>
                      <div className="text-sm text-squad-primary-600">
                        {squad.lastActivity || 'Watched "The Matrix" together'}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {/* Member avatars */}
                        {[1, 2, 3].map((i) => (
                          <div 
                            key={i}
                            className="member-avatar bg-gradient-to-r from-squad-primary-400 to-squad-secondary-400"
                            style={{
                              backgroundImage: `url(https://api.dicebear.com/7.x/avataaars/svg?seed=${squad.id}${i})`,
                              backgroundSize: 'cover'
                            }}
                          />
                        ))}
                        {squad.members?.length > 3 && (
                          <div className="member-avatar bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                            +{squad.members.length - 3}
                          </div>
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        {squad.isActive ? (
                          <span className="text-green-600 flex items-center">
                            <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                            Active now
                          </span>
                        ) : (
                          `Last seen ${squad.lastSeen || '2 hours ago'}`
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent Activity */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {[
              { text: "You watched 'Inception' with Movie Night Squad", time: "2 hours ago", emoji: "🎬" },
              { text: "Sarah joined your 'Friends Forever' squad", time: "1 day ago", emoji: "👋" },
              { text: "You created a new squad 'Anime Lovers'", time: "3 days ago", emoji: "✨" },
              { text: "You sent 23 reactions during 'The Matrix'", time: "1 week ago", emoji: "🎭" }
            ].map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="flex items-center space-x-4 p-4">
                  <div className="text-2xl">{activity.emoji}</div>
                  <div className="flex-1">
                    <p className="text-gray-800">{activity.text}</p>
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Create Squad Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <div className="p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Create New Squad</h3>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Squad Name
            </label>
            <input
              type="text"
              value={squadName}
              onChange={(e) => setSquadName(e.target.value)}
              placeholder="Enter squad name..."
              className="input w-full"
              onKeyPress={(e) => e.key === 'Enter' && handleCreateSquad()}
            />
          </div>
          <div className="flex space-x-4">
            <Button 
              onClick={handleCreateSquad}
              disabled={!squadName.trim()}
              className="flex-1 bg-squad-primary-600 hover:bg-squad-primary-700 text-white"
            >
              Create Squad
            </Button>
            <Button 
              onClick={() => setShowCreateModal(false)}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;
