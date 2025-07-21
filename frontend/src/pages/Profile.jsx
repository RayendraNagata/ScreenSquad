import React from 'react';
import { motion } from 'framer-motion';
import useAuthStore from '../store/authStore';
import { Card } from '../components/ui/index.jsx';
import Button from '../components/ui/Button';

const Profile = () => {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-950 pt-20">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <h1 className="text-3xl font-bold text-gray-100 mb-8">Profile Settings</h1>
          
          <Card className="mb-6">
            <div className="flex items-center space-x-4 mb-6">
              <img
                src={user?.avatar}
                alt={user?.username}
                className="w-20 h-20 rounded-full"
              />
              <div>
                <h2 className="text-xl font-semibold text-gray-100">{user?.username}</h2>
                <p className="text-gray-300">{user?.email}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Member Since
                </label>
                <p className="text-gray-400">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Last Active
                </label>
                <p className="text-gray-400">
                  {user?.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Today'}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Account Actions</h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                ✏️ Edit Profile
              </Button>
              <Button variant="outline" className="w-full justify-start">
                🔒 Change Password
              </Button>
              <Button variant="outline" className="w-full justify-start">
                🎨 Avatar Settings
              </Button>
              <Button 
                variant="danger" 
                onClick={handleLogout}
                className="w-full justify-start"
              >
                🚪 Sign Out
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
