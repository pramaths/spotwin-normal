export enum IOutcome {
  YES = "YES",
  NO = "NO"
}

export enum IDifficultyLevel {
  EASY = "EASY",
  MEDIUM = "MEDIUM",
  HARD = "HARD"
}

export enum IContestStatus {
  OPEN = "OPEN",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  CLOSED = 'CLOSED',
  RESOLVED = 'RESOLVED',
}

export interface IUser {
  id: string
  username: string
  imageUrl: string
  phoneNumber: string
  referralCode: string
  points: number
  totalContests: number
  totalContestsWon: number
  referrals?: IUser[]
  isReferralCodeUsed?: boolean
  expoPushToken?: string
}
export interface ITeam {
  id: string
  name: string
  description: string
  imageUrl: string
  country: string
}

export interface ISport {
  id: string
  name: string
  description: string
  imageUrl: string
}

export interface IEvent {
  id: string
  title: string
  description: string
  eventImageUrl: string
  startDate: string
  endDate: string
  status: string
  sport?: ISport
}

export interface IMatch {
  id: string;
  title: string;
  teamAId: string;
  teamBId: string;
  teamA: ITeam;
  teamB: ITeam;
  event: IEvent;
  status: string;
  startTime: string;
  endTime: string;

}

export interface IContest {
  id: string
  name: string
  entryFee: number
  currency: string
  description: string
  status: IContestStatus | string
  questions: IQuestion[]
  match?: IMatch
  event?: IEvent
}

export interface IQuestion {
  id: string;
  question: string;
  outcome: IOutcome;
  difficultyLevel: IDifficultyLevel;
  contestId: string;
}

export interface IUserPrediction {
  id: string;
  userId: string;
  contestId: string;
  questionId: string;
  isCorrect: boolean | null;
  question: IQuestion;
  prediction?: IOutcome;
}

export interface ITicket {
  id: string;
  stadium: string;
  date: string;
  time: string;
  teamA: ITeam;
  teamB: ITeam;
  costPoints: number;
}
