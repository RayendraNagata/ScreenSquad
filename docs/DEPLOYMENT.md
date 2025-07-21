# ScreenSquad Deployment Guide

## Quick Production Setup

### Prerequisites
- Node.js 18+
- Domain with SSL certificate
- Production server (VPS, cloud instance, etc.)

### 1. Environment Setup
```bash
# Clone and setup
git clone https://github.com/RayendraNagata/ScreenSquad.git
cd ScreenSquad
npm run setup

# Configure environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit with production values
nano backend/.env  # Set JWT_SECRET, NODE_ENV=production
nano frontend/.env # Set VITE_API_URL to your domain
```

### 2. Build and Deploy
```bash
# Build frontend
npm run build

# Start backend with PM2
npm install -g pm2
cd backend && pm2 start server.js --name screensquad

# Setup auto-restart
pm2 startup
pm2 save
```

### 3. Reverse Proxy (Nginx)
```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    # SSL configuration
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # Frontend (static files)
    location / {
        root /path/to/ScreenSquad/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Socket.IO
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## Platform-Specific Deployments

### Heroku
```bash
# Backend
heroku create screensquad-api
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret
git subtree push --prefix=backend heroku main

# Frontend (Netlify/Vercel)
cd frontend && npm run build
# Deploy dist/ folder to static hosting
```

### Docker
```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: ./backend
    ports: ["3000:3000"]
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
  
  nginx:
    image: nginx:alpine
    ports: ["80:80", "443:443"]
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./frontend/dist:/usr/share/nginx/html
```

### DigitalOcean App Platform
Create `app.yaml`:
```yaml
name: screensquad
services:
- name: backend
  source_dir: /backend
  run_command: npm start
  environment_slug: node-js
  envs:
  - key: NODE_ENV
    value: production
  - key: JWT_SECRET
    type: SECRET
    value: your-secret-key

- name: frontend
  source_dir: /frontend
  build_command: npm run build
  environment_slug: node-js
  static_sites:
  - name: frontend
    source_dir: /dist
```

## Environment Variables

### Backend (.env)
```bash
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secret-production-key-32+chars
FRONTEND_URL=https://yourdomain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (.env)
```bash
VITE_API_URL=https://api.yourdomain.com
VITE_SOCKET_URL=https://api.yourdomain.com
VITE_DEV_MODE=false
VITE_ENABLE_DEBUG_LOGGING=false
```

## SSL/HTTPS Setup

### Let's Encrypt (Free SSL)
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Performance Optimization

### Backend
- Use PM2 cluster mode for multiple processes
- Enable compression middleware
- Implement Redis for session storage (optional)

### Frontend
- Already optimized with code splitting
- Enable gzip compression in Nginx
- Set proper cache headers for static assets

### Monitoring
```bash
# PM2 monitoring
pm2 monit

# Health check
curl -f https://yourdomain.com/api/health

# Log monitoring
pm2 logs --lines 100
```

## Security Checklist
- [ ] HTTPS enabled with valid SSL certificate
- [ ] JWT secret is strong (32+ characters)
- [ ] Environment variables secured
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Security headers configured (helmet)
- [ ] Regular updates scheduled

## Troubleshooting

### Common Issues
1. **502 Bad Gateway**: Check if backend is running (`pm2 status`)
2. **CORS errors**: Verify FRONTEND_URL matches your domain
3. **Socket.IO connection failed**: Ensure SSL is properly configured
4. **Video playback issues**: HTTPS required for screen sharing

### Debug Commands
```bash
# Check backend status
pm2 status
pm2 logs screensquad

# Test API
curl https://yourdomain.com/api/health

# Check nginx
sudo nginx -t
sudo systemctl status nginx
```

For additional support, see the main [README](../README.md) or create an issue on GitHub.