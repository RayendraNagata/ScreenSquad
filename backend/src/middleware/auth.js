import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  // Handle demo tokens for development
  if (token.startsWith('demo-token-')) {
    // Extract user info from demo token or create default demo user
    req.user = {
      userId: '1',
      username: 'Demo User',
      email: 'demo@screensquad.com'
    };
    return next();
  }

  // Handle JWT-like tokens created by frontend demo
  if (token.includes('.')) {
    try {
      // Try to decode the payload part
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        if (payload.userId) {
          req.user = {
            userId: payload.userId,
            username: payload.username || 'Demo User',
            email: payload.email || 'demo@screensquad.com'
          };
          return next();
        }
      }
    } catch (decodeError) {
      // Fall through to JWT verification
    }
  }

  // Standard JWT verification
  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};
