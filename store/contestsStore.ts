import { create } from 'zustand'
import { IContest } from '../types';

interface ContestsStore {
  contests: IContest[];
  userContests: IContest[];
  setContests: (contests: IContest[]) => void;
  setUserContests: (userContests: IContest[]) => void;
  getContestById: (id: string) => IContest | undefined;
}

export const useContestsStore = create<ContestsStore>((set, get) => ({
  contests: [],
  userContests: [],
  setContests: (contests: IContest[]) => {
    set({ contests });
  },

  setUserContests: (userContests: IContest[]) => {
    set({ userContests });
  },
  removeContest: (id: string) => {
    set((state) => ({
      contests: state.contests.filter((contest) => contest.id !== id),
    }));
  },
  getContestById: (id: string) => {
    return get().contests.find(contest => contest.id === id);
  },
}));
