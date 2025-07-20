import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createDemoToken, mockLogin } from '../utils/demoAuth';
import { determineUserRole } from '../utils/roleUtils';

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
          // Use the mock login function that creates proper JWT-like tokens
          const { user: demoUser, token: jwtToken } = await mockLogin(email, password);

          // Determine user role
          const userWithRole = {
            ...demoUser,
            role: determineUserRole(demoUser)
          };

          set({
            user: userWithRole,
            token: jwtToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return { success: true, user: userWithRole };
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
          // Demo registration - create new user
          await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
          
          const demoUser = {
            id: Date.now().toString(),
            username: username || 'NewUser',
            email: email,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + email,
            createdAt: new Date().toISOString()
          };

          // Add role to new user
          const userWithRole = {
            ...demoUser,
            role: determineUserRole(demoUser)
          };

          const jwtToken = createDemoToken(userWithRole);

          set({
            user: userWithRole,
            token: jwtToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return { success: true, user: userWithRole };
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
