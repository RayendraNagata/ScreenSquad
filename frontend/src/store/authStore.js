import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (email, password) => {
        set({ isLoading: true, error: null });

        try {
          // Demo login with predefined accounts
          await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
          
          // Demo accounts for easy testing
          const demoAccounts = {
            'demo@screensquad.com': {
              id: '1',
              username: 'ScreenSquad Demo',
              email: 'demo@screensquad.com',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
            },
            'john@example.com': {
              id: '2', 
              username: 'John Doe',
              email: 'john@example.com',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
            },
            'sarah@example.com': {
              id: '3',
              username: 'Sarah Wilson', 
              email: 'sarah@example.com',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
            }
          };

          let demoUser;
          
          // Check if it's a predefined demo account
          if (demoAccounts[email]) {
            demoUser = {
              ...demoAccounts[email],
              createdAt: new Date().toISOString()
            };
          } else {
            // Create new demo user for any email
            demoUser = {
              id: Date.now().toString(),
              username: email.split('@')[0] || 'DemoUser',
              email: email,
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + email,
              createdAt: new Date().toISOString()
            };
          }

          set({
            user: demoUser,
            token: 'demo-token-' + Date.now(),
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return { success: true, user: demoUser };
        } catch (error) {
          set({
            isLoading: false,
            error: error.message,
          });
          return { success: false, error: error.message };
        }
      },

      register: async (email, password, username) => {
        set({ isLoading: true, error: null });

        try {
          // Demo registration - remove this when backend is ready
          await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
          
          const demoUser = {
            id: Date.now().toString(),
            username: username || 'NewUser',
            email: email,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + email,
            createdAt: new Date().toISOString()
          };

          set({
            user: demoUser,
            token: 'demo-token-' + Date.now(),
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return { success: true, user: demoUser };
        } catch (error) {
          set({
            isLoading: false,
            error: error.message,
          });
          return { success: false, error: error.message };
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      clearError: () => {
        set({ error: null });
      },

      // Utility functions
      updateProfile: async (updates) => {
        const { user } = get();
        if (!user) return { success: false, error: 'Not authenticated' };

        set({ isLoading: true, error: null });

        try {
          // Demo profile update
          await new Promise(resolve => setTimeout(resolve, 800));
          
          const updatedUser = { ...user, ...updates };
          set({
            user: updatedUser,
            isLoading: false,
          });

          return { success: true, user: updatedUser };
        } catch (error) {
          set({
            isLoading: false,
            error: error.message,
          });
          return { success: false, error: error.message };
        }
      },

      checkAuth: async () => {
        const { token } = get();
        if (!token) return;

        set({ isLoading: true });

        try {
          // Demo auth check - in real app, verify token with backend
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // If we have a token in localStorage, assume user is still authenticated
          set({ isLoading: false });
        } catch (error) {
          // Token is invalid, logout
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: 'Session expired',
          });
        }
      },
    }),
    {
      name: 'screensquad-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
