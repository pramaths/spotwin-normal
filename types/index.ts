export interface Contest {
    id: string;
    league: string;
    match: string;
    teams: {
      home: string;
      away: string;
    };
    logo?: string;
  }
  
  export interface Question {
    id: string;
    contestId: string;
    question: string;
    endsAt: string;
    imageUrl: string;
  }
  
  export interface User {
    id: string;
    name: string;
    avatar: string;
  }

  export interface ITeam{
    id: string;
    name: string;
    imageUrl: string;
    country: string;
  }
  
  export interface ISport{
    id: string;
    name: string;
    imageUrl: string;
    description?: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
  }

  export interface IEvent{
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

  export enum IQuestionStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
  }

  export enum IOutcomeType{
    YES = 'YES',
    NO = 'NO'
  }

  export interface IFeaturedVideos{
    contestId: string;
    eventId: string;
    videos: IFeaturedVideo[];
  }


  export interface IFeaturedVideo{
    id: string;
    question: string;
    videoUrl: string;
  }

  export interface IUser{
    id: string;
    twitterUsername: string;
    publicAddress: string;
    imageUrl: string; 
  }
