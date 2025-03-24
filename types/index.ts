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
  LIVE = "LIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED"
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
  totalContestsLost: number
  referrals: IUser[]
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
  outcome?: IOutcome;
}