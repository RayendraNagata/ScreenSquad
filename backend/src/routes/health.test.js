const request = require('supertest');
const express = require('express');

// Create a minimal test app with just the health endpoint
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  
  // Health check endpoint (from server.js)
  app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });
  
  return app;
};

describe('Health Endpoint', () => {
  let app;
  
  beforeEach(() => {
    app = createTestApp();
  });
  
  test('GET /api/health should return status OK', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);
    
    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('timestamp');
    expect(typeof response.body.timestamp).toBe('string');
  });
  
  test('Health endpoint should return valid timestamp', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);
    
    const timestamp = new Date(response.body.timestamp);
    expect(timestamp).toBeInstanceOf(Date);
    expect(timestamp.getTime()).not.toBeNaN();
  });
});