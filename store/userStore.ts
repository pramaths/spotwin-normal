import { create } from 'zustand';
import { IUser } from '@/types';


interface UserStore {
  user: IUser | null;
  setUser: (user: IUser | null) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user: IUser | null) => set({ user }),
}));



