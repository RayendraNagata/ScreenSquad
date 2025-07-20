// Role-based access control utilities

export const USER_ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator', 
  USER: 'user',
  GUEST: 'guest'
};

export const PERMISSIONS = {
  // Admin permissions
  ACCESS_DEBUG: 'access_debug',
  VIEW_DIAGNOSTICS: 'view_diagnostics',
  MANAGE_USERS: 'manage_users',
  MANAGE_SQUADS: 'manage_squads',
  VIEW_SYSTEM_LOGS: 'view_system_logs',
  
  // Moderator permissions
  MODERATE_CONTENT: 'moderate_content',
  KICK_USERS: 'kick_users',
  MANAGE_SQUAD_SETTINGS: 'manage_squad_settings',
  
  // User permissions
  CREATE_SQUAD: 'create_squad',
  JOIN_SQUAD: 'join_squad',
  UPLOAD_VIDEO: 'upload_video',
  SEND_MESSAGES: 'send_messages',
  
  // Guest permissions
  VIEW_PUBLIC_SQUADS: 'view_public_squads'
};

// Role permission mapping
const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: [
    PERMISSIONS.ACCESS_DEBUG,
    PERMISSIONS.VIEW_DIAGNOSTICS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_SQUADS,
    PERMISSIONS.VIEW_SYSTEM_LOGS,
    PERMISSIONS.MODERATE_CONTENT,
    PERMISSIONS.KICK_USERS,
    PERMISSIONS.MANAGE_SQUAD_SETTINGS,
    PERMISSIONS.CREATE_SQUAD,
    PERMISSIONS.JOIN_SQUAD,
    PERMISSIONS.UPLOAD_VIDEO,
    PERMISSIONS.SEND_MESSAGES,
    PERMISSIONS.VIEW_PUBLIC_SQUADS
  ],
  [USER_ROLES.MODERATOR]: [
    PERMISSIONS.MODERATE_CONTENT,
    PERMISSIONS.KICK_USERS,
    PERMISSIONS.MANAGE_SQUAD_SETTINGS,
    PERMISSIONS.CREATE_SQUAD,
    PERMISSIONS.JOIN_SQUAD,
    PERMISSIONS.UPLOAD_VIDEO,
    PERMISSIONS.SEND_MESSAGES,
    PERMISSIONS.VIEW_PUBLIC_SQUADS
  ],
  [USER_ROLES.USER]: [
    PERMISSIONS.CREATE_SQUAD,
    PERMISSIONS.JOIN_SQUAD,
    PERMISSIONS.UPLOAD_VIDEO,
    PERMISSIONS.SEND_MESSAGES,
    PERMISSIONS.VIEW_PUBLIC_SQUADS
  ],
  [USER_ROLES.GUEST]: [
    PERMISSIONS.VIEW_PUBLIC_SQUADS
  ]
};

// Admin user emails (in production, this would be in database)
const ADMIN_EMAILS = [
  'admin@screensquad.com',
  'rayendra@screensquad.com',
  'demo@screensquad.com' // Demo admin account
];

// Check if user has specific role
export const hasRole = (user, role) => {
  if (!user || !user.role) return false;
  return user.role === role;
};

// Check if user has specific permission
export const hasPermission = (user, permission) => {
  if (!user || !user.role) return false;
  
  const userPermissions = ROLE_PERMISSIONS[user.role] || [];
  return userPermissions.includes(permission);
};

// Check if user is admin
export const isAdmin = (user) => {
  return hasRole(user, USER_ROLES.ADMIN);
};

// Check if user is moderator or above
export const isModerator = (user) => {
  return hasRole(user, USER_ROLES.ADMIN) || hasRole(user, USER_ROLES.MODERATOR);
};

// Determine user role based on email and other factors
export const determineUserRole = (user) => {
  if (!user || !user.email) return USER_ROLES.GUEST;
  
  // Check if user is admin
  if (ADMIN_EMAILS.includes(user.email.toLowerCase())) {
    return USER_ROLES.ADMIN;
  }
  
  // Check for moderator patterns (example: emails ending with @mod.screensquad.com)
  if (user.email.endsWith('@mod.screensquad.com')) {
    return USER_ROLES.MODERATOR;
  }
  
  // Default to user role
  return USER_ROLES.USER;
};

// Get all permissions for a role
export const getRolePermissions = (role) => {
  return ROLE_PERMISSIONS[role] || [];
};

// Check if user can access debug features
export const canAccessDebug = (user) => {
  return hasPermission(user, PERMISSIONS.ACCESS_DEBUG);
};

// Check if user can view diagnostics
export const canViewDiagnostics = (user) => {
  return hasPermission(user, PERMISSIONS.VIEW_DIAGNOSTICS);
};

// Get user role display name
export const getRoleDisplayName = (role) => {
  const displayNames = {
    [USER_ROLES.ADMIN]: 'Administrator',
    [USER_ROLES.MODERATOR]: 'Moderator',
    [USER_ROLES.USER]: 'User',
    [USER_ROLES.GUEST]: 'Guest'
  };
  return displayNames[role] || 'Unknown';
};

// Get role color for UI
export const getRoleColor = (role) => {
  const colors = {
    [USER_ROLES.ADMIN]: 'text-red-600 bg-red-100',
    [USER_ROLES.MODERATOR]: 'text-blue-600 bg-blue-100', 
    [USER_ROLES.USER]: 'text-green-600 bg-green-100',
    [USER_ROLES.GUEST]: 'text-gray-600 bg-gray-100'
  };
  return colors[role] || 'text-gray-600 bg-gray-100';
};
