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
    solanaContestId: string;
    contestPublicKey:string;
    createdAt: string;
    updatedAt: string;
    event: IEvent;
    contestCreator: string;
  }

  export interface IContestWithVideos extends IContest {
    featuredVideos: Array<{
      id: string;
      submissionId: string;
      videoUrl: string;
      thumbnailUrl: string;
      userId: string;
      contestId: string;
      correctOutcome: null | string;
      numberOfBets: number;
      question: string;
      createdAt: string;
      updatedAt: string;
    }>;
  }

  export enum IQuestionStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
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
    balance?: number;
  }


  export enum OutcomeType{
    YES = 'YES',
    NO = 'NO'
  }

  export interface IPrediction {
    id: string;
    userId: string;
    contestId: string;
    videoId: string;
    prediction: string;
    isCorrect: boolean | null;
    createdAt: string;
    updatedAt: string;
    video: {
      id: string;
      submissionId: string;
      videoUrl: string;
      question: string | null;
      thumbnailUrl: string;
      userId: string;
      contestId: string;
      correctOutcome: string | null;
      numberOfBets: number;
      createdAt: string;
      updatedAt: string;
    };
  }