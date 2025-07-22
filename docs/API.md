# ScreenSquad API Documentation

## Base URL
- Development: `http://localhost:3000/api`
- Production: `https://your-domain.com/api`

## Authentication
ScreenSquad uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Key API Endpoints

### Health Check
```
GET /api/health
```
Returns server status and timestamp.

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Authenticate user  
- `GET /api/auth/me` - Get current user profile

### Squads (Watch Parties)
- `POST /api/squads` - Create new squad
- `GET /api/squads/my` - Get user's squads
- `GET /api/squads/:squadId` - Get squad details
- `POST /api/squads/:squadId/join` - Join squad
- `POST /api/squads/:squadId/leave` - Leave squad

### Videos
- `POST /api/videos` - Add video to squad library
- `GET /api/videos/squad/:squadId` - Get squad videos
- `DELETE /api/videos/:videoId` - Remove video

## Socket.IO Events

### Connection
```javascript
const socket = io('http://localhost:3000', {
  auth: { token: 'your-jwt-token' }
});
```

### Video Control Events
- `playVideo` - Play video for all squad members
- `pauseVideo` - Pause video for all squad members  
- `seekVideo` - Seek to specific time
- `changeVideo` - Switch to different video

### Chat Events
- `chatMessage` - Send chat message
- `reaction` - Send emoji reaction

### Listening Events
- `videoStateChanged` - Video play/pause/seek updates
- `newMessage` - New chat messages
- `userJoined`/`userLeft` - Squad member updates
- `newReaction` - Emoji reactions

## Error Responses
All errors follow this format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE"
}
```

## Rate Limiting
- General POST requests: 100 requests per 15 minutes
- Returns `429` status when exceeded

## Security
- JWT authentication required for protected routes
- CORS configured for frontend domain only
- Use HTTPS in production
- Content Security Policy headers included

For complete API documentation with examples, see the full API documentation in the repository.