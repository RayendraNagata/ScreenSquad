import { create } from 'zustand';

const useSquadStore = create((set, get) => ({
  // State - Initialize with demo data
  squads: [],
  currentSquad: null,
  isLoading: false,
  error: null,
  isInitialized: false, // Track if we've loaded initial data

  // Demo data
  demoSquads: [
    {
      id: '1',
      name: 'Movie Night Squad',
      members: [
        { id: '1', username: 'You', avatar: 'avatar1.jpg', isHost: true },
        { id: '2', username: 'Sarah', avatar: 'avatar2.jpg', isHost: false },
        { id: '3', username: 'Mike', avatar: 'avatar3.jpg', isHost: false }
      ],
      isActive: true,
      lastActivity: 'Watched "Inception" together',
      lastSeen: 'Active now',
      createdAt: new Date().toISOString(),
      description: 'Weekly movie nights with friends'
    },
    {
      id: '2',
      name: 'Friends Forever',
      members: [
        { id: '1', username: 'You', avatar: 'avatar1.jpg', isHost: false },
        { id: '4', username: 'Emma', avatar: 'avatar4.jpg', isHost: true },
        { id: '5', username: 'John', avatar: 'avatar5.jpg', isHost: false },
        { id: '6', username: 'Lisa', avatar: 'avatar6.jpg', isHost: false }
      ],
      isActive: false,
      lastActivity: 'Planned to watch "The Matrix"',
      lastSeen: '2 hours ago',
      createdAt: new Date().toISOString(),
      description: 'Best friends squad'
    },
    {
      id: '3',
      name: 'Anime Lovers',
      members: [
        { id: '1', username: 'You', avatar: 'avatar1.jpg', isHost: true },
        { id: '7', username: 'Kenji', avatar: 'avatar7.jpg', isHost: false }
      ],
      isActive: false,
      lastActivity: 'Watched "Your Name" together',
      lastSeen: '1 day ago',
      createdAt: new Date().toISOString(),
      description: 'For anime enthusiasts'
    }
  ],

  // Actions
  fetchSquads: async () => {
    console.log('Fetching squads...');
    const { isInitialized } = get();
    
    // If already initialized, don't fetch again to preserve created squads
    if (isInitialized) {
      console.log('Already initialized, skipping fetch');
      return;
    }
    
    set({ isLoading: true, error: null });

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { demoSquads } = get();
      console.log('Loading demo squads (first time):', demoSquads);
      
      set({
        squads: [...demoSquads],
        isLoading: false,
        error: null,
        isInitialized: true
      });
    } catch (error) {
      console.error('Error fetching squads:', error);
      const { demoSquads } = get();
      set({
        squads: [...demoSquads],
        isLoading: false,
        error: error.message,
        isInitialized: true
      });
    }
  },

  fetchSquadById: async (squadId) => {
    console.log('Fetching squad by ID:', squadId);
    set({ isLoading: true, error: null });

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const { demoSquads, squads } = get();
      const allSquads = [...demoSquads, ...squads];
      
      console.log('Available squads:', allSquads.map(s => ({ id: s.id, name: s.name })));
      
      const squad = allSquads.find(s => s.id === squadId);
      console.log('Found squad:', squad);
      
      if (squad) {
        set({
          currentSquad: squad,
          isLoading: false,
        });
        return { success: true, squad };
      } else {
        console.error('Squad not found:', squadId);
        set({
          currentSquad: null,
          isLoading: false,
          error: 'Squad not found'
        });
        return { success: false, error: 'Squad not found' };
      }
    } catch (error) {
      console.error('Error fetching squad:', error);
      set({
        currentSquad: null,
        isLoading: false,
        error: error.message,
      });
      return { success: false, error: error.message };
    }
  },

  createSquad: async (name, description = '') => {
    console.log('Creating squad:', name);
    set({ isLoading: true, error: null });

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const newSquad = {
        id: Date.now().toString(),
        name,
        description,
        members: [
          { id: '1', username: 'You', avatar: 'avatar1.jpg', isHost: true }
        ],
        isActive: false,
        lastActivity: 'Squad created',
        lastSeen: 'Just now',
        createdAt: new Date().toISOString()
      };

      const { squads } = get();
      const updatedSquads = [...squads, newSquad];

      set({
        squads: updatedSquads,
        isLoading: false,
      });

      console.log('Squad created successfully:', newSquad);
      return { success: true, squad: newSquad };
    } catch (error) {
      console.error('Error creating squad:', error);
      set({
        isLoading: false,
        error: error.message,
      });
      return { success: false, error: error.message };
    }
  },

  // Force refresh squads (for debugging or manual refresh)
  refreshSquads: async () => {
    console.log('Force refreshing squads...');
    set({ isLoading: true, error: null, isInitialized: false });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const { demoSquads } = get();
      
      set({
        squads: [...demoSquads],
        isLoading: false,
        error: null,
        isInitialized: true
      });
    } catch (error) {
      console.error('Error refreshing squads:', error);
      set({
        isLoading: false,
        error: error.message,
      });
    }
  },

  joinSquad: async (squadId) => {
    console.log('Joining squad:', squadId);
    set({ isLoading: true, error: null });

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const { squads } = get();
      const squadIndex = squads.findIndex(s => s.id === squadId);

      if (squadIndex !== -1) {
        const updatedSquads = [...squads];
        const currentUser = { id: '1', username: 'You', avatar: 'avatar1.jpg', isHost: false };
        
        // Add user to squad if not already a member
        if (!updatedSquads[squadIndex].members.some(m => m.id === currentUser.id)) {
          updatedSquads[squadIndex].members.push(currentUser);
        }

        set({
          squads: updatedSquads,
          isLoading: false,
        });

        return { success: true };
      } else {
        throw new Error('Squad not found');
      }
    } catch (error) {
      console.error('Error joining squad:', error);
      set({
        isLoading: false,
        error: error.message,
      });
      return { success: false, error: error.message };
    }
  },

  leaveSquad: async (squadId) => {
    console.log('Leaving squad:', squadId);
    set({ isLoading: true, error: null });

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const { squads } = get();
      const updatedSquads = squads.map(squad => {
        if (squad.id === squadId) {
          return {
            ...squad,
            members: squad.members.filter(m => m.id !== '1') // Remove current user
          };
        }
        return squad;
      }).filter(squad => squad.members.length > 0); // Remove empty squads

      set({
        squads: updatedSquads,
        currentSquad: null, // Clear current squad if leaving
        isLoading: false,
      });

      return { success: true };
    } catch (error) {
      console.error('Error leaving squad:', error);
      set({
        isLoading: false,
        error: error.message,
      });
      return { success: false, error: error.message };
    }
  },

  clearCurrentSquad: () => {
    set({ currentSquad: null });
  },

  clearError: () => {
    set({ error: null });
  }
}));

export default useSquadStore;
