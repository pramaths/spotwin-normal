import { create } from 'zustand'
import { IContest } from '../types';

interface ContestsStore {
  contests: IContest[];
  setContests: (contests: IContest[]) => void;
  getContestById: (id: string) => IContest | undefined;
}

export const useContestsStore = create<ContestsStore>((set, get) => ({
  contests: [],
  
  setContests: (contests: IContest[]) => {
    set({ contests });
  },
  
  getContestById: (id: string) => {
    return get().contests.find(contest => contest.id === id);
  },
}));
