import React from 'react';
import { hasPermission, isAdmin } from '../utils/roleUtils';
import useAuthStore from '../store/authStore';

const PermissionGate = ({ 
  permission,
  adminOnly = false,
  fallback = null,
  children 
}) => {
  const { user } = useAuthStore();

  // Check admin only access
  if (adminOnly && !isAdmin(user)) {
    return fallback;
  }

  // Check specific permission
  if (permission && !hasPermission(user, permission)) {
    return fallback;
  }

  return children;
};

export default PermissionGate;
