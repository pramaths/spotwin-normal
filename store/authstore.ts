import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  isNewUser: boolean;
  setAuthenticated: (value: boolean) => void;
  setIsNewUser: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isNewUser: false,
  setAuthenticated: (value: boolean) => set({ isAuthenticated: value }),
  setIsNewUser: (value: boolean) => set({ isNewUser: value }),
}));
