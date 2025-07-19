// Socket.IO event handlers for ScreenSquad
const squads = new Map(); // In-memory squad storage (will be replaced with database)
const userSockets = new Map(); // Track user-socket mapping

export const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`👤 User connected: ${socket.id}`);

    // Ping/Pong for latency measurement
    socket.on('ping', (data) => {
      // Echo back with server timestamp
      socket.emit('pong', {
        ...data,
        serverTimestamp: Date.now()
      });
    });

    // Triangular method ping/pong
    socket.on('triangular-ping', (data) => {
      const t2 = Date.now(); // Server timestamp
      
      // Send back t1 (original client time) and t2 (server time)
      socket.emit('triangular-pong', {
        id: data.id,
        t1: data.t1, // Original client timestamp
        t2: t2       // Server timestamp
      });
    });

    // Request sync from client
    socket.on('request-sync', (data) => {
      const { timestamp, currentTime, isPlaying, squadId } = data;
      
      if (squadId && squads.has(squadId)) {
        const squad = squads.get(squadId);
        const currentState = squad.playState;
        
        // Calculate server's current time based on play state
        let serverTime = currentState.currentTime;
        if (currentState.isPlaying) {
          const timeDiff = (Date.now() - currentState.lastUpdate) / 1000;
          serverTime += timeDiff;
        }
        
        // Send sync response
        socket.emit('sync-response', {
          serverTime,
          isPlaying: currentState.isPlaying,
          timestamp,
          serverTimestamp: Date.now()
        });
      }
    });

    // Join a squad
    socket.on('join-squad', async (data) => {
      const { squadId, userId, username } = data;
      
      try {
        // Leave any previous squad
        Array.from(socket.rooms).forEach(room => {
          if (room !== socket.id) {
            socket.leave(room);
          }
        });

        // Join the new squad room
        socket.join(squadId);
        
        // Track user
        userSockets.set(userId, socket.id);
        
        // Get or create squad
        if (!squads.has(squadId)) {
          squads.set(squadId, {
            id: squadId,
            members: new Map(),
            currentVideo: null,
            playState: {
              isPlaying: false,
              currentTime: 0,
              lastUpdate: Date.now()
            },
            reactions: []
          });
        }

        const squad = squads.get(squadId);
        squad.members.set(userId, {
          id: userId,
          username,
          socketId: socket.id,
          isHost: squad.members.size === 0, // First member is host
          joinedAt: Date.now()
        });

        // Notify others
        socket.to(squadId).emit('member-joined', {
          member: squad.members.get(userId),
          totalMembers: squad.members.size
        });

        // Send current state to new member
        socket.emit('squad-state', {
          squad: {
            id: squadId,
            members: Array.from(squad.members.values()),
            currentVideo: squad.currentVideo,
            playState: squad.playState
          }
        });

        console.log(`🎭 User ${username} joined squad ${squadId}`);
      } catch (error) {
        console.error('Error joining squad:', error);
        socket.emit('error', { message: 'Failed to join squad' });
      }
    });

    // Video synchronization events
    socket.on('video-play', (data) => {
      handleVideoSync(socket, 'play', data);
    });

    socket.on('video-pause', (data) => {
      handleVideoSync(socket, 'pause', data);
    });

    socket.on('video-seek', (data) => {
      handleVideoSync(socket, 'seek', data);
    });

    socket.on('video-load', (data) => {
      handleVideoLoad(socket, data);
    });

    // Reactions
    socket.on('send-reaction', (data) => {
      handleReaction(socket, data);
    });

    // Chat messages
    socket.on('send-message', (data) => {
      handleChatMessage(socket, data);
    });

    // Screen sharing
    socket.on('start-screen-share', (data) => {
      handleScreenShare(socket, 'start', data);
    });

    socket.on('stop-screen-share', (data) => {
      handleScreenShare(socket, 'stop', data);
    });

    // WebRTC signaling
    socket.on('webrtc-offer', (data) => {
      socket.to(data.target).emit('webrtc-offer', {
        offer: data.offer,
        from: socket.id
      });
    });

    socket.on('webrtc-answer', (data) => {
      socket.to(data.target).emit('webrtc-answer', {
        answer: data.answer,
        from: socket.id
      });
    });

    socket.on('webrtc-ice-candidate', (data) => {
      socket.to(data.target).emit('webrtc-ice-candidate', {
        candidate: data.candidate,
        from: socket.id
      });
    });

    // Disconnect handling
    socket.on('disconnect', () => {
      handleDisconnect(socket);
    });
  });
};

const handleVideoSync = (socket, action, data) => {
  const squadId = getSquadIdFromSocket(socket);
  if (!squadId) return;

  const squad = squads.get(squadId);
  if (!squad) return;

  const userId = getUserIdFromSocket(socket);
  const member = squad.members.get(userId);
  
  // Only host or authorized members can control playback
  if (!member || !member.isHost) {
    socket.emit('error', { message: 'Not authorized to control playback' });
    return;
  }

  // Update squad state
  const now = Date.now();
  squad.playState = {
    isPlaying: action === 'play',
    currentTime: data.currentTime || squad.playState.currentTime,
    lastUpdate: now
  };

  // Broadcast to all members
  socket.to(squadId).emit(`video-${action}`, {
    currentTime: squad.playState.currentTime,
    timestamp: now,
    by: member.username
  });

  console.log(`🎬 Video ${action} in squad ${squadId} by ${member.username}`);
};

const handleVideoLoad = (socket, data) => {
  const squadId = getSquadIdFromSocket(socket);
  if (!squadId) return;

  const squad = squads.get(squadId);
  if (!squad) return;

  const userId = getUserIdFromSocket(socket);
  const member = squad.members.get(userId);
  
  if (!member || !member.isHost) {
    socket.emit('error', { message: 'Not authorized to load videos' });
    return;
  }

  squad.currentVideo = {
    id: data.videoId,
    title: data.title,
    url: data.url,
    type: data.type, // 'file', 'stream', 'screen-share'
    loadedBy: member.username,
    loadedAt: Date.now()
  };

  // Broadcast to all members
  socket.to(squadId).emit('video-loaded', squad.currentVideo);
  
  console.log(`📺 Video loaded in squad ${squadId}: ${data.title}`);
};

const handleReaction = (socket, data) => {
  const squadId = getSquadIdFromSocket(socket);
  if (!squadId) return;

  const squad = squads.get(squadId);
  if (!squad) return;

  const userId = getUserIdFromSocket(socket);
  const member = squad.members.get(userId);
  
  if (!member) return;

  const reaction = {
    id: Date.now().toString(),
    emoji: data.emoji,
    user: member.username,
    timestamp: Date.now(),
    videoTime: data.videoTime || 0
  };

  squad.reactions.push(reaction);
  
  // Keep only last 100 reactions
  if (squad.reactions.length > 100) {
    squad.reactions = squad.reactions.slice(-100);
  }

  // Broadcast reaction
  io.to(squadId).emit('reaction-received', reaction);
  
  console.log(`😀 Reaction ${data.emoji} from ${member.username} in squad ${squadId}`);
};

const handleChatMessage = (socket, data) => {
  const squadId = getSquadIdFromSocket(socket);
  if (!squadId) return;

  const squad = squads.get(squadId);
  if (!squad) return;

  const userId = getUserIdFromSocket(socket);
  const member = squad.members.get(userId);
  
  if (!member) return;

  const message = {
    id: Date.now().toString(),
    text: data.message,
    user: member.username,
    timestamp: Date.now(),
    videoTime: data.videoTime || 0
  };

  // Broadcast message
  io.to(squadId).emit('chat-message', message);
  
  console.log(`💬 Message from ${member.username} in squad ${squadId}: ${data.message}`);
};

const handleScreenShare = (socket, action, data) => {
  const squadId = getSquadIdFromSocket(socket);
  if (!squadId) return;

  const squad = squads.get(squadId);
  if (!squad) return;

  const userId = getUserIdFromSocket(socket);
  const member = squad.members.get(userId);
  
  if (!member) return;

  if (action === 'start') {
    // Broadcast screen share start
    socket.to(squadId).emit('screen-share-started', {
      by: member.username,
      userId: userId
    });
    
    console.log(`🖥️ Screen share started by ${member.username} in squad ${squadId}`);
  } else {
    // Broadcast screen share stop
    socket.to(squadId).emit('screen-share-stopped', {
      by: member.username,
      userId: userId
    });
    
    console.log(`🛑 Screen share stopped by ${member.username} in squad ${squadId}`);
  }
};

const handleDisconnect = (socket) => {
  const userId = getUserIdFromSocket(socket);
  const squadId = getSquadIdFromSocket(socket);
  
  if (squadId && userId) {
    const squad = squads.get(squadId);
    if (squad && squad.members.has(userId)) {
      const member = squad.members.get(userId);
      squad.members.delete(userId);
      
      // Notify others
      socket.to(squadId).emit('member-left', {
        member,
        totalMembers: squad.members.size
      });
      
      // If squad is empty, clean it up
      if (squad.members.size === 0) {
        squads.delete(squadId);
      } else if (member.isHost) {
        // Transfer host to next member
        const newHost = Array.from(squad.members.values())[0];
        newHost.isHost = true;
        socket.to(squadId).emit('host-changed', { newHost });
      }
      
      console.log(`👋 User ${member.username} left squad ${squadId}`);
    }
  }
  
  userSockets.delete(userId);
  console.log(`🔌 User disconnected: ${socket.id}`);
};

// Helper functions
const getSquadIdFromSocket = (socket) => {
  const rooms = Array.from(socket.rooms);
  return rooms.find(room => room !== socket.id);
};

const getUserIdFromSocket = (socket) => {
  for (const [userId, socketId] of userSockets.entries()) {
    if (socketId === socket.id) {
      return userId;
    }
  }
  return null;
};
