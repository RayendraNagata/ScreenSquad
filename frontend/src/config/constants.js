// Path aliases untuk menghindari konflik import
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  SQUAD: '/squad',
  PROFILE: '/profile',
  JOIN: '/join'
};

export const API_ENDPOINTS = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    REFRESH: '/api/auth/refresh'
  },
  SQUADS: {
    BASE: '/api/squads',
    MY_SQUADS: '/api/squads/my-squads',
    JOIN: (squadId) => `/api/squads/${squadId}/join`,
    LEAVE: (squadId) => `/api/squads/${squadId}/leave`,
    INVITE: (squadId) => `/api/squads/${squadId}/invite`
  }
};
