import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { Card, LoadingSpinner } from '../components/ui/index.jsx';
import Button from '../components/ui/Button';

const Notifications = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, invites, activities, system
  const [notifications, setNotifications] = useState([]);

  // Dummy notifications data - will be replaced with real API calls
  const dummyNotifications = [
    {
      id: 1,
      type: 'invite',
      title: 'Squad Invitation',
      message: 'Sarah invited you to join "Movie Night Squad"',
      timestamp: '2 minutes ago',
      isRead: false,
      actionRequired: true,
      metadata: {
        squadId: 'squad-123',
        inviterId: 'user-456',
        squadName: 'Movie Night Squad'
      }
    },
    {
      id: 2,
      type: 'activity',
      title: 'New Video Added',
      message: 'John added "Avengers: Endgame" to Marvel Squad',
      timestamp: '15 minutes ago',
      isRead: false,
      actionRequired: false,
      metadata: {
        squadId: 'squad-789',
        videoId: 'video-123',
        addedBy: 'John'
      }
    },
    {
      id: 3,
      type: 'activity',
      title: 'Squad Activity',
      message: 'Your squad "Comedy Central" started watching The Office',
      timestamp: '1 hour ago',
      isRead: true,
      actionRequired: false,
      metadata: {
        squadId: 'squad-456',
        squadName: 'Comedy Central'
      }
    },
    {
      id: 4,
      type: 'system',
      title: 'Achievement Unlocked',
      message: 'Congratulations! You\'ve watched 50 hours this month 🎉',
      timestamp: '2 hours ago',
      isRead: true,
      actionRequired: false,
      metadata: {
        achievementType: 'watch_time',
        milestone: 50
      }
    },
    {
      id: 5,
      type: 'invite',
      title: 'Squad Invitation',
      message: 'Mike invited you to join "Study Together"',
      timestamp: '1 day ago',
      isRead: false,
      actionRequired: true,
      metadata: {
        squadId: 'squad-999',
        inviterId: 'user-789',
        squadName: 'Study Together'
      }
    },
    {
      id: 6,
      type: 'system',
      title: 'Feature Update',
      message: 'New screen sharing feature is now available! Try it out.',
      timestamp: '2 days ago',
      isRead: true,
      actionRequired: false,
      metadata: {
        updateType: 'feature',
        feature: 'screen_sharing'
      }
    }
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setNotifications(dummyNotifications);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    return notification.type === filter;
  });

  // Stats
  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.isRead).length,
    invites: notifications.filter(n => n.type === 'invite').length,
    actionRequired: notifications.filter(n => n.actionRequired).length
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const handleInviteAction = (notificationId, action) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && action === 'accept') {
      // Navigate to squad
      navigate(`/squad/${notification.metadata.squadId}`);
    }
    // Remove notification after action
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'invite':
        return (
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
            </svg>
          </div>
        );
      case 'activity':
        return (
          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2l4.5 3-4.5 3V5z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'system':
        return (
          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center pt-20">
        <div className="text-center">
          <LoadingSpinner size="xl" />
          <p className="mt-4 text-gray-300">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                  <path d="M10 2L3 9h3v8h8v-8h3l-7-7zM9 9V7.5L10 6l1 1.5V9h-2z" />
                </svg>
                Notifications
              </h1>
              <p className="text-xl text-gray-300">
                Stay updated with your squad activities
              </p>
            </div>
            <div className="flex space-x-3">
              <Button 
                onClick={markAllAsRead}
                variant="outline"
                disabled={stats.unread === 0}
              >
                Mark All Read
              </Button>
              <Button 
                onClick={() => navigate('/dashboard')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Dashboard
              </Button>
            </div>
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
            <div className="text-gray-300">Total</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-orange-500 mb-2">{stats.unread}</div>
            <div className="text-gray-300">Unread</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-green-500 mb-2">{stats.invites}</div>
            <div className="text-gray-300">Invites</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-red-500 mb-2">{stats.actionRequired}</div>
            <div className="text-gray-300">Action Needed</div>
          </Card>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex space-x-2">
            {[
              { key: 'all', label: 'All Notifications' },
              { key: 'invite', label: 'Invites' },
              { key: 'activity', label: 'Activities' },
              { key: 'system', label: 'System' }
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
        </motion.div>

        {/* Notifications List */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {filteredNotifications.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="text-6xl mb-4">🔔</div>
              <h3 className="text-xl font-bold text-gray-100 mb-2">No notifications</h3>
              <p className="text-gray-300 mb-6">
                You're all caught up! No new notifications.
              </p>
              <Button 
                onClick={() => navigate('/dashboard')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Back to Dashboard
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Card 
                    className={`p-6 transition-all duration-300 hover:shadow-xl ${
                      !notification.isRead ? 'border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      {getNotificationIcon(notification.type)}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className={`text-lg font-semibold ${
                              notification.isRead ? 'text-gray-300' : 'text-gray-100'
                            }`}>
                              {notification.title}
                            </h3>
                            <p className={`text-sm mt-1 ${
                              notification.isRead ? 'text-gray-400' : 'text-gray-300'
                            }`}>
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              {notification.timestamp}
                            </p>
                          </div>
                          
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-blue-500 hover:text-blue-400 text-sm"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                        
                        {notification.actionRequired && notification.type === 'invite' && (
                          <div className="flex space-x-3 mt-4">
                            <Button
                              onClick={() => handleInviteAction(notification.id, 'accept')}
                              className="bg-green-600 hover:bg-green-700 text-white"
                              size="sm"
                            >
                              Accept Invite
                            </Button>
                            <Button
                              onClick={() => handleInviteAction(notification.id, 'decline')}
                              variant="outline"
                              size="sm"
                            >
                              Decline
                            </Button>
                          </div>
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

export default Notifications;
