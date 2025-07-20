import { create } from 'zustand';
import { getAuthHeaders } from '../utils/demoAuth';
import useAuthStore from './authStore';

const useSquadStore = create((set, get) => ({
  // State
  squads: [],
  currentSquad: null,
  isLoading: false,
  error: null,

  // Demo data
  demoSquads: [
    {
      id: '1',
      name: 'Movie Night Squad',
      members: [
        { id: '1', username: 'You', avatar: 'avatar1.jpg' },
        { id: '2', username: 'Sarah', avatar: 'avatar2.jpg' },
        { id: '3', username: 'Mike', avatar: 'avatar3.jpg' }
      ],
      isActive: true,
      lastActivity: 'Watched "Inception" together',
      lastSeen: 'Active now',
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Friends Forever',
      members: [
        { id: '1', username: 'You', avatar: 'avatar1.jpg' },
        { id: '4', username: 'Emma', avatar: 'avatar4.jpg' },
        { id: '5', username: 'John', avatar: 'avatar5.jpg' },
        { id: '6', username: 'Lisa', avatar: 'avatar6.jpg' }
      ],
      isActive: false,
      lastActivity: 'Planned to watch "The Matrix"',
      lastSeen: '2 hours ago',
      createdAt: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Anime Lovers',
      members: [
        { id: '1', username: 'You', avatar: 'avatar1.jpg' },
        { id: '7', username: 'Kenji', avatar: 'avatar7.jpg' }
      ],
      isActive: false,
      lastActivity: 'Watched "Your Name" together',
      lastSeen: '1 day ago',
      createdAt: new Date().toISOString()
    }
  ],

  // Actions
  fetchSquads: async () => {
    set({ isLoading: true, error: null });

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const { demoSquads } = get();
      set({
        squads: demoSquads,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error.message,
      });
    }
  },

  fetchSquadById: async (squadId) => {
    set({ isLoading: true, error: null });

    try {
      console.log('Fetching squad by ID:', squadId);
      
      // Try API first if user has proper token
      const authStore = useAuthStore.getState ? useAuthStore.getState() : useAuthStore;
      const { token, user } = authStore;
      
      if (token && !token.startsWith('demo-token-')) {
        console.log('Using backend API with JWT token');
        try {
          const headers = getAuthHeaders(token);
          const response = await fetch(`http://localhost:3001/api/squads/${squadId}`, {
            method: 'GET',
            headers: headers
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('Backend API response:', data);
            
            set({
              currentSquad: data.squad,
              isLoading: false,
            });
            return { success: true, squad: data.squad };
          } else {
            console.log('Backend API failed, falling back to demo data');
          }
        } catch (apiError) {
          console.log('Backend API error, falling back to demo data:', apiError);
        }
      }
      
      // Fallback to demo data
      console.log('Using demo/fallback data');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { demoSquads, squads } = get();
      
      // Ensure demoSquads are included in search
      const allSquads = [
        ...demoSquads,
        ...squads,
        // Fallback demo squads if not loaded
        {
          id: '1',
          name: 'Movie Night Squad',
          members: [
            { id: '1', username: 'You', avatar: 'avatar1.jpg' },
            { id: '2', username: 'Sarah', avatar: 'avatar2.jpg' },
            { id: '3', username: 'Mike', avatar: 'avatar3.jpg' }
          ],
          isActive: true,
          lastActivity: 'Watched "Inception" together',
          lastSeen: 'Active now',
          createdAt: new Date().toISOString()
        }
      ];
      
      console.log('All available squads:', allSquads.map(s => ({ id: s.id, name: s.name })));
      
      const squad = allSquads.find(s => s.id === squadId);
      console.log('Found squad:', squad);
      
      if (squad) {
        set({
          currentSquad: squad,
          isLoading: false,
        });
        return { success: true, squad };
      } else {
        set({
          currentSquad: null,
          isLoading: false,
          error: 'Squad not found'
        });
        return { success: false, error: 'Squad not found' };
      }
    } catch (error) {
      set({
        isLoading: false,
        error: error.message,
      });
      return { success: false, error: error.message };
    }
  },

  createSquad: async (name) => {
    set({ isLoading: true, error: null });

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newSquad = {
        id: Date.now().toString(),
        name: name,
        members: [
          { id: '1', username: 'You', avatar: 'avatar1.jpg' }
        ],
        isActive: false,
        lastActivity: 'Squad created',
        lastSeen: 'Just now',
        createdAt: new Date().toISOString()
      };

      set(state => ({
        squads: [...state.squads, newSquad],
        isLoading: false,
      }));

      return { success: true, squad: newSquad };
    } catch (error) {
      set({
        isLoading: false,
        error: error.message,
      });
      return { success: false, error: error.message };
    }
  },

  joinSquad: async (squadId) => {
    set({ isLoading: true, error: null });

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Demo implementation
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      set({
        isLoading: false,
        error: error.message,
      });
      return { success: false, error: error.message };
    }
  },

  leaveSquad: async (squadId) => {
    set({ isLoading: true, error: null });

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        squads: state.squads.filter(squad => squad.id !== squadId),
        isLoading: false,
      }));

      return { success: true };
    } catch (error) {
      set({
        isLoading: false,
        error: error.message,
      });
      return { success: false, error: error.message };
    }
  },

  setCurrentSquad: (squad) => {
    set({ currentSquad: squad });
  },

  clearError: () => {
    set({ error: null });
  },

  // Squad management
  updateSquad: async (squadId, updates) => {
    set({ isLoading: true, error: null });

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        squads: state.squads.map(squad =>
          squad.id === squadId ? { ...squad, ...updates } : squad
        ),
        isLoading: false,
      }));

      return { success: true };
    } catch (error) {
      set({
        isLoading: false,
        error: error.message,
      });
      return { success: false, error: error.message };
    }
  },

  inviteToSquad: async (squadId, email) => {
    set({ isLoading: true, error: null });

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Demo implementation - in real app, send invitation
      set({ isLoading: false });
      return { success: true, message: 'Invitation sent!' };
    } catch (error) {
      set({
        isLoading: false,
        error: error.message,
      });
      return { success: false, error: error.message };
    }
  }
}));

export default useSquadStore;
