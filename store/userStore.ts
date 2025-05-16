import { create } from 'zustand';
import { IUser } from '@/types';
import apiClient from '@/utils/api';
import { TOKENANDSTAKEBALANCE } from '@/routes/api';

interface UserStore {
  user: IUser | null;
  setUser: (user: IUser | null) => void;
  updateBalances: () => Promise<void>;
}

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  setUser: (user: IUser | null) => set({ user }),
  updateBalances: async () => {
    try {
      console.log('Fetching user balances...');
      // The authorization header will be set automatically by the apiClient
      const response = await apiClient<{ stakedAmount: number, tokenAmount: number }>(TOKENANDSTAKEBALANCE, 'GET');
      
      if (response.success && response.data) {
        const { stakedAmount, tokenAmount } = response.data;
        console.log('Balances fetched successfully:', { stakedAmount, tokenAmount });
        
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              totalStaked: stakedAmount,
              usdcBalance: tokenAmount,
              customTokenBalance: stakedAmount // Using staked amount as custom token balance as per requirements
            }
          });
        }
      } else {
        console.warn('Failed to fetch balances:', response);
      }
    } catch (error) {
      console.error('Failed to update balances:', error);
    }
  }
}));

