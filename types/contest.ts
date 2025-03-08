export interface ISport {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ITeam {
  id: string;
  name: string;
  imageUrl: string;
  country: string;
}

export interface IEvent {
  id: string;
  title: string;
  description: string;
  eventImageUrl: string;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  sport: ISport;
  teamA: ITeam;
  teamB: ITeam;
}

export interface IContest {
  id: string;
  name: string;
  entryFee: number;
  currency: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  event: IEvent;
}

export interface IPrediction {
  id: string;
  userId: string;
  contestId: string;
  videoId: string;
  question: string;
  answer: 'YES' | 'NO';
  createdAt: string;
  updatedAt: string;
  thumbnailUrl: string;
}
