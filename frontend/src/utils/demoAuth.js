// Demo authentication utilities
// In production, tokens would be handled by the backend

// Simple JWT-like token encoder for demo purposes
// This creates a valid-looking token that the backend can decode
export const createDemoToken = (user) => {
  // Create a simple base64 encoded payload for demo
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    userId: user.id,
    username: user.username,
    email: user.email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  }));
  
  // For demo, just use a simple signature
  const signature = btoa('demo-signature');
  
  return `${header}.${payload}.${signature}`;
};

// Utility to check if demo mode is enabled
export const isDemoMode = () => {
  return import.meta.env.VITE_DEMO_MODE === 'true' || import.meta.env.DEV;
};

// Mock API call for demo login
export const mockLogin = async (email, password) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Demo accounts
  const demoAccounts = {
    'demo@screensquad.com': {
      id: '1',
      username: 'ScreenSquad Demo',
      email: 'demo@screensquad.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
      role: 'admin' // Admin account
    },
    'admin@screensquad.com': {
      id: '1001',
      username: 'Admin',
      email: 'admin@screensquad.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      role: 'admin'
    },
    'john@example.com': {
      id: '2', 
      username: 'John Doe',
      email: 'john@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
      role: 'user'
    },
    'sarah@example.com': {
      id: '3',
      username: 'Sarah Wilson', 
      email: 'sarah@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      role: 'moderator'
    }
  };

  let user;
  
  // Check if it's a predefined demo account
  if (demoAccounts[email]) {
    user = {
      ...demoAccounts[email],
      createdAt: new Date().toISOString()
    };
  } else {
    // Create new demo user for any email
    user = {
      id: Date.now().toString(),
      username: email.split('@')[0] || 'DemoUser',
      email: email,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + email,
      createdAt: new Date().toISOString()
    };
  }

  // Create a valid-looking JWT token for demo
  const token = createDemoToken(user);

  return { user, token };
};

// Get authorization headers for API calls
export const getAuthHeaders = (token) => {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};
