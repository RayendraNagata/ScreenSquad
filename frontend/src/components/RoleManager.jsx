import React, { useState } from 'react';
import { useUserRole, useVideoControl } from '../hooks/useGlobalStore';
import { Crown, Shield, Eye, Users, Settings, LogOut } from 'lucide-react';

/**
 * Role Management Panel using Global Store
 * Allows role changes and displays permissions
 */
const RoleManager = () => {
  const {
    userRole,
    permissions,
    squadId,
    isConnected,
    changeRole,
    joinSquad,
    leaveSquad,
    isHost,
    isModerator,
    canPromoteMembers
  } = useUserRole();

  const { currentVideo } = useVideoControl();
  const [newSquadId, setNewSquadId] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const handleRoleChange = (newRole) => {
    if (changeRole(newRole)) {
      console.log(`Role changed to ${newRole}`);
    }
  };

  const handleJoinSquad = () => {
    if (newSquadId.trim()) {
      joinSquad(newSquadId.trim());
      setNewSquadId('');
    }
  };

  const handleLeaveSquad = () => {
    if (confirm('Are you sure you want to leave the squad?')) {
      leaveSquad();
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'host':
        return <Crown className="w-4 h-4 text-purple-400" />;
      case 'moderator':
        return <Shield className="w-4 h-4 text-blue-400" />;
      case 'viewer':
        return <Eye className="w-4 h-4 text-gray-400" />;
      default:
        return null;
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      host: 'bg-purple-500 text-white',
      moderator: 'bg-blue-500 text-white',
      viewer: 'bg-gray-500 text-white'
    };
    return badges[role] || badges.viewer;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
          <Users className="w-5 h-5" />
          <span>Role Manager</span>
        </h3>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Current Status */}
      <div className="bg-gray-900 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getRoleIcon(userRole)}
            <span className="text-white font-medium">Current Role</span>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadge(userRole)}`}>
            {userRole.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-400">Squad</span>
          <div className="flex items-center space-x-2">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-white text-sm">
              {squadId || 'Not in squad'}
            </span>
          </div>
        </div>

        {currentVideo && (
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Watching</span>
            <span className="text-white text-sm truncate max-w-40">
              {currentVideo.title}
            </span>
          </div>
        )}
      </div>

      {/* Role Selection (Host Only) */}
      {canPromoteMembers && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-300">Change Role</h4>
          <div className="grid grid-cols-3 gap-2">
            {['host', 'moderator', 'viewer'].map((role) => (
              <button
                key={role}
                onClick={() => handleRoleChange(role)}
                className={`p-3 rounded-lg border transition-all ${
                  userRole === role
                    ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                    : 'border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white'
                }`}
              >
                <div className="flex flex-col items-center space-y-1">
                  {getRoleIcon(role)}
                  <span className="text-xs font-medium">
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Permissions Display */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-300">Your Permissions</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className={`p-2 rounded ${permissions.canControlPlayback ? 'bg-green-900/30 text-green-400' : 'bg-gray-900 text-gray-500'}`}>
            Control Playback
          </div>
          <div className={`p-2 rounded ${permissions.canChangeVideo ? 'bg-green-900/30 text-green-400' : 'bg-gray-900 text-gray-500'}`}>
            Change Video
          </div>
          <div className={`p-2 rounded ${permissions.canKickMembers ? 'bg-green-900/30 text-green-400' : 'bg-gray-900 text-gray-500'}`}>
            Kick Members
          </div>
          <div className={`p-2 rounded ${permissions.canChangeSettings ? 'bg-green-900/30 text-green-400' : 'bg-gray-900 text-gray-500'}`}>
            Change Settings
          </div>
        </div>
      </div>

      {/* Squad Management */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-300">Squad Management</h4>
        
        {!squadId ? (
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Enter Squad ID"
              value={newSquadId}
              onChange={(e) => setNewSquadId(e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
            <button
              onClick={handleJoinSquad}
              disabled={!newSquadId.trim()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Join
            </button>
          </div>
        ) : (
          <button
            onClick={handleLeaveSquad}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Leave Squad</span>
          </button>
        )}
      </div>

      {/* Advanced Settings */}
      {showSettings && (
        <div className="border-t border-gray-700 pt-4 space-y-3">
          <h4 className="text-sm font-medium text-gray-300">Advanced Settings</h4>
          
          <div className="space-y-2 text-xs text-gray-400">
            <div>Role persistence: Enabled</div>
            <div>Auto-reconnect: {isConnected ? 'Active' : 'Inactive'}</div>
            <div>Sync status: {currentVideo ? 'Active' : 'Waiting for video'}</div>
          </div>

          {isHost && (
            <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-3">
              <div className="text-yellow-400 text-xs font-medium mb-1">Host Features</div>
              <div className="text-yellow-300 text-xs">
                As host, you have full control over the squad and can promote/demote members.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RoleManager;
