import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { PERMISSIONS, USER_ROLES, getRoleDisplayName, getRoleColor } from '../../utils/roleUtils';
import PermissionGate from '../../components/PermissionGate';
import RoleBadge from '../../components/RoleBadge';
import Button from '../../components/ui/Button';

const AdminUsers = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading demo users
    const loadUsers = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const demoUsers = [
        {
          id: '1',
          username: 'ScreenSquad Demo',
          email: 'demo@screensquad.com',
          role: USER_ROLES.ADMIN,
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
          createdAt: '2024-01-15T10:30:00Z',
          lastActive: '2024-07-20T05:45:00Z',
          status: 'online'
        },
        {
          id: '2',
          username: 'John Doe',
          email: 'john@example.com',
          role: USER_ROLES.USER,
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
          createdAt: '2024-02-20T14:15:00Z',
          lastActive: '2024-07-19T22:30:00Z',
          status: 'offline'
        },
        {
          id: '3',
          username: 'Sarah Wilson',
          email: 'sarah@example.com',
          role: USER_ROLES.MODERATOR,
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
          createdAt: '2024-03-10T09:45:00Z',
          lastActive: '2024-07-20T03:20:00Z',
          status: 'online'
        },
        {
          id: '4',
          username: 'Mike Johnson',
          email: 'mike@example.com',
          role: USER_ROLES.USER,
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
          createdAt: '2024-04-05T16:20:00Z',
          lastActive: '2024-07-18T19:45:00Z',
          status: 'offline'
        }
      ];
      
      setUsers(demoUsers);
      setIsLoading(false);
    };

    loadUsers();
  }, []);

  const handleRoleChange = (userId, newRole) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  const getStatusColor = (status) => {
    return status === 'online' ? 'text-green-600' : 'text-gray-400';
  };

  const getStatusIcon = (status) => {
    return status === 'online' ? '🟢' : '⚫';
  };

  return (
    <PermissionGate 
      permission={PERMISSIONS.MANAGE_USERS}
      fallback={
        <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
            <Button onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-600 mt-2">Manage users, roles, and permissions</p>
              </div>
              <div className="flex items-center space-x-4">
                <Button 
                  onClick={() => navigate('/diagnostic')}
                  variant="outline"
                >
                  🔧 Diagnostics
                </Button>
                <Button onClick={() => navigate('/dashboard')}>
                  ← Back to Dashboard
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow">
              <div className="text-2xl font-bold text-gray-900">{users.length}</div>
              <div className="text-gray-600">Total Users</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow">
              <div className="text-2xl font-bold text-green-600">
                {users.filter(u => u.status === 'online').length}
              </div>
              <div className="text-gray-600">Online Now</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow">
              <div className="text-2xl font-bold text-purple-600">
                {users.filter(u => u.role === USER_ROLES.ADMIN).length}
              </div>
              <div className="text-gray-600">Administrators</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow">
              <div className="text-2xl font-bold text-blue-600">
                {users.filter(u => u.role === USER_ROLES.MODERATOR).length}
              </div>
              <div className="text-gray-600">Moderators</div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">All Users</h2>
            </div>
            
            {isLoading ? (
              <div className="px-6 py-8 text-center">
                <div className="text-gray-500">Loading users...</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Active
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              className="h-10 w-10 rounded-full"
                              src={user.avatar}
                              alt={user.username}
                            />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.username}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <RoleBadge role={user.role} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`flex items-center text-sm ${getStatusColor(user.status)}`}>
                            <span className="mr-2">{getStatusIcon(user.status)}</span>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.lastActive).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <select
                              value={user.role}
                              onChange={(e) => handleRoleChange(user.id, e.target.value)}
                              className="text-sm border border-gray-300 rounded px-2 py-1"
                              disabled={user.id === currentUser?.id}
                            >
                              {Object.values(USER_ROLES).map(role => (
                                <option key={role} value={role}>
                                  {getRoleDisplayName(role)}
                                </option>
                              ))}
                            </select>
                            {user.id !== currentUser?.id && (
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </PermissionGate>
  );
};

export default AdminUsers;
