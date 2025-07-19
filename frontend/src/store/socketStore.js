import { create } from 'zustand';
import io from 'socket.io-client';

const useSocketStore = create((set, get) => ({
  // State
  socket: null,
  isConnected: false,
  currentRoom: null,
  error: null,
  connectionAttempts: 0,
  lastPing: null,
  latency: 0,

  // Room/Squad state
  roomMembers: [],
  roomData: {},

  // Actions
  connect: () => {
    const socket = io('http://localhost:3001', {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000,
    });

    // Connection events
    socket.on('connect', () => {
      console.log('🟢 Socket connected:', socket.id);
      set({ 
        socket,
        isConnected: true, 
        error: null,
        connectionAttempts: 0
      });
    });

    socket.on('disconnect', (reason) => {
      console.log('🔴 Socket disconnected:', reason);
      set({ isConnected: false });
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      set(state => ({ 
        error: error.message,
        connectionAttempts: state.connectionAttempts + 1
      }));
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
      set({ isConnected: true, error: null });
    });

    socket.on('reconnect_error', (error) => {
      console.error('🔄❌ Socket reconnection error:', error);
    });

    // Ping/Pong for latency monitoring
    socket.on('pong', (timestamp) => {
      const latency = Date.now() - timestamp;
      set({ latency, lastPing: Date.now() });
    });

    // Squad/Room events
    socket.on('room-joined', (data) => {
      console.log('🏠 Joined room:', data.roomId);
      set({
        currentRoom: data.roomId,
        roomMembers: data.members,
        roomData: data.roomData
      });
    });

    socket.on('room-left', (data) => {
      console.log('🚪 Left room:', data.roomId);
      set({
        currentRoom: null,
        roomMembers: [],
        roomData: {}
      });
    });

    socket.on('member-joined', (member) => {
      console.log('👋 Member joined:', member.username);
      set(state => ({
        roomMembers: [...state.roomMembers.filter(m => m.id !== member.id), member]
      }));
    });

    socket.on('member-left', (memberId) => {
      console.log('👋 Member left:', memberId);
      set(state => ({
        roomMembers: state.roomMembers.filter(m => m.id !== memberId)
      }));
    });

    // Video sync events
    socket.on('video-sync', (data) => {
      console.log('🎬 Video sync:', data);
      // This will be handled by the video store
    });

    socket.on('video-loaded', (data) => {
      console.log('📹 Video loaded by:', data.userId);
      // This will be handled by the video store
    });

    // Chat events
    socket.on('chat-message', (message) => {
      console.log('💬 Chat message:', message);
      // This will be handled by the Squad component
    });

    // Reaction events
    socket.on('reaction', (reaction) => {
      console.log('😊 Reaction:', reaction);
      // This will be handled by the Squad component
    });

    set({ socket });

    // Start ping monitoring
    const pingInterval = setInterval(() => {
      if (socket.connected) {
        socket.emit('ping', Date.now());
      }
    }, 5000);

    // Cleanup on disconnect
    socket.on('disconnect', () => {
      clearInterval(pingInterval);
    });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({
        socket: null,
        isConnected: false,
        currentRoom: null,
        roomMembers: [],
        roomData: {},
        error: null
      });
    }
  },

  // Room/Squad management
  joinRoom: (roomId, userData) => {
    const { socket } = get();
    if (socket && socket.connected) {
      socket.emit('join-room', { roomId, userData });
      return true;
    }
    return false;
  },

  leaveRoom: () => {
    const { socket, currentRoom } = get();
    if (socket && socket.connected && currentRoom) {
      socket.emit('leave-room', { roomId: currentRoom });
      return true;
    }
    return false;
  },

  // Video sync
  emitVideoAction: (action, data = {}) => {
    const { socket, currentRoom } = get();
    if (socket && socket.connected && currentRoom) {
      socket.emit('video-action', {
        roomId: currentRoom,
        action,
        timestamp: Date.now(),
        ...data
      });
      return true;
    }
    return false;
  },

  emitVideoLoaded: (videoData) => {
    const { socket, currentRoom } = get();
    if (socket && socket.connected && currentRoom) {
      socket.emit('video-loaded', {
        roomId: currentRoom,
        videoData,
        timestamp: Date.now()
      });
      return true;
    }
    return false;
  },

  // Chat
  sendMessage: (message) => {
    const { socket, currentRoom } = get();
    if (socket && socket.connected && currentRoom) {
      socket.emit('chat-message', {
        roomId: currentRoom,
        message,
        timestamp: Date.now()
      });
      return true;
    }
    return false;
  },

  // Reactions
  sendReaction: (reactionData) => {
    const { socket, currentRoom } = get();
    if (socket && socket.connected && currentRoom) {
      socket.emit('reaction', {
        roomId: currentRoom,
        ...reactionData,
        timestamp: Date.now()
      });
      return true;
    }
    return false;
  },

  // Screen sharing
  emitScreenShare: (streamData) => {
    const { socket, currentRoom } = get();
    if (socket && socket.connected && currentRoom) {
      socket.emit('screen-share', {
        roomId: currentRoom,
        streamData,
        timestamp: Date.now()
      });
      return true;
    }
    return false;
  },

  // Voice chat
  emitVoiceState: (voiceState) => {
    const { socket, currentRoom } = get();
    if (socket && socket.connected && currentRoom) {
      socket.emit('voice-state', {
        roomId: currentRoom,
        voiceState,
        timestamp: Date.now()
      });
      return true;
    }
    return false;
  },

  // Utility functions
  clearError: () => {
    set({ error: null });
  },

  getConnectionStatus: () => {
    const { isConnected, latency, connectionAttempts } = get();
    return {
      isConnected,
      latency,
      connectionAttempts,
      quality: latency < 100 ? 'excellent' : latency < 300 ? 'good' : 'poor'
    };
  },

  // Advanced features
  requestSync: () => {
    const { socket, currentRoom } = get();
    if (socket && socket.connected && currentRoom) {
      socket.emit('request-sync', {
        roomId: currentRoom,
        timestamp: Date.now()
      });
      return true;
    }
    return false;
  },

  updateUserStatus: (status) => {
    const { socket, currentRoom } = get();
    if (socket && socket.connected && currentRoom) {
      socket.emit('user-status', {
        roomId: currentRoom,
        status,
        timestamp: Date.now()
      });
      return true;
    }
    return false;
  }
}));

export default useSocketStore;
