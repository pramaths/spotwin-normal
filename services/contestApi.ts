import { IContest } from '../types/contest';

// Interface for contest videos with questions
export interface IContestVideo {
  id: string;
  question: string;
  videoUrl: string;
  thumbnailUrl: string;
  contestId: string;
}

// Mock contests data
export const MOCK_CONTESTS: IContest[] = [
  {
    id: 'f984ea94-a07e-4bff-a802-1694f51256045',
    name: 'Europa League',
    entryFee: 0.2,
    currency: 'SOL',
    description: 'A contest where two teams compete in European football',
    status: 'OPEN',
    createdAt: '2025-03-05T10:32:19.895Z',
    updatedAt: '2025-03-05T10:32:19.895Z',
    event: {
      id: '077e38f3-6275-4c68-920f-3a7de8ba9bbf',
      title: 'Europa League',
      description: 'UEFA Europa League tournament',
      eventImageUrl: 'https://9shootnew.s3.us-east-1.amazonaws.com/ucl.png ',
      startDate: '2025-03-05T08:58:46.130Z',
      endDate: '2025-03-05T08:58:46.130Z',
      status: 'OPEN',
      createdAt: '2025-03-05T09:04:41.701Z',
      updatedAt: '2025-03-05T09:27:20.389Z',
      sport: {
        id: '3dc44aff-9748-44fc-aa74-1379213a4363',
        name: 'Football',
        description: 'A team sport played with a ball',
        imageUrl: 'https://9shootnew.s3.us-east-1.amazonaws.com/manutd.png',
        isActive: true,
        createdAt: '2025-03-02T18:07:04.227Z',
        updatedAt: '2025-03-02T18:07:04.227Z',
      },
      teamA: {
        id: '4ec72fe7-263b-42e5-af1f-b0c26fed97a7',
        name: 'Manchester United',
        imageUrl: 'https://9shootnew.s3.us-east-1.amazonaws.com/manutd.png',
        country: 'England',
      },
      teamB: {
        id: '59217b82-77ae-4340-ba13-483bea11a7d6',
        name: 'Real Sociedad',
        imageUrl: 'https://9shootnew.s3.us-east-1.amazonaws.com/realsociedad.png',
        country: 'Spain',
      },
    },
  },
  {
    id: 'f984ea94-a07e-4bff-a802',
    name: 'UEFA Champions League',
    entryFee: 0.5,
    currency: 'SOL',
    description: 'The premier European club football tournament',
    status: 'OPEN',
    createdAt: '2025-03-05T10:32:19.895Z',
    updatedAt: '2025-03-05T10:32:19.895Z',
    event: {
      id: '077e38f3-6275-4c68-920f-3a7de8ba9bba',
      title: 'UEFA Champions League',
      description: 'UEFA Champions League tournament',
      eventImageUrl: 'https://9shootnew.s3.us-east-1.amazonaws.com/ucl.png ',
      startDate: '2025-03-05T08:58:46.130Z',
      endDate: '2025-03-05T08:58:46.130Z',
      status: 'OPEN',
      createdAt: '2025-03-05T09:04:41.701Z',
      updatedAt: '2025-03-05T09:27:20.389Z',
      sport: {
        id: '3dc44aff-9748-44fc-aa74-1379213a4363',
        name: 'Football',
        description: 'A team sport played with a ball',
        imageUrl: 'https://s3.ap-south-1.amazonaws.com/sizzils3/e2b67264-426b-4499-9b7c-266f1556f38b-5492.jpg',
        isActive: true,
        createdAt: '2025-03-02T18:07:04.227Z',
        updatedAt: '2025-03-02T18:07:04.227Z',
      },
      teamB: {
        id: '4ec72fe7-263b-42e5-af1f-b0c26fed97a7',
        name: 'Real Madrid',
        imageUrl: 'https://9shootnew.s3.us-east-1.amazonaws.com/realmadrid.png',
        country: 'Spain',
      },
      teamA: {
        id: '59217b82-77ae-4340-ba13-483bea11a7d6',
        name: 'Atletico Madrid',
        imageUrl: 'https://9shootnew.s3.us-east-1.amazonaws.com/athletico.png',
        country: 'Spain',
      },
    },
  },
  {
    id: 'f984ea94-a07e-4bff-a802-1694f5125',
    name: 'Premier League',
    entryFee: 0.3,
    currency: 'SOL',
    description: 'English Premier League match predictions',
    status: 'OPEN',
    createdAt: '2025-03-05T10:32:19.895Z',
    updatedAt: '2025-03-05T10:32:19.895Z',
    event: {
      id: '077e38f3-6275-4c68-920f-3a7de8ba9bbc',
      title: 'Premier League',
      description: 'English Premier League match',
      eventImageUrl: 'https://9shootnew.s3.us-east-1.amazonaws.com/ucl.png ',
      startDate: '2025-03-05T08:58:46.130Z',
      endDate: '2025-03-05T08:58:46.130Z',
      status: 'OPEN',
      createdAt: '2025-03-05T09:04:41.701Z',
      updatedAt: '2025-03-05T09:27:20.389Z',
      sport: {
        id: '3dc44aff-9748-44fc-aa74-1379213a4363',
        name: 'Football',
        description: 'A team sport played with a ball',
        imageUrl: 'https://s3.ap-south-1.amazonaws.com/sizzils3/e2b67264-426b-4499-9b7c-266f1556f38b-5492.jpg',
        isActive: true,
        createdAt: '2025-03-02T18:07:04.227Z',
        updatedAt: '2025-03-02T18:07:04.227Z',
      },
      teamA: {
        id: '4ec72fe7-263b-42e5-af1f-b0c26fed97a7',
        name: 'Liverpool',
        imageUrl: 'https://9shootnew.s3.us-east-1.amazonaws.com/liverpool.png',
        country: 'England',
      },
      teamB: {
        id: '59217b82-77ae-4340-ba13-483bea11a7d6',
        name: 'Manchester City',
        imageUrl: 'https://9shootnew.s3.us-east-1.amazonaws.com/mancity.png',
        country: 'England',
      },
    },
  }
];

// Fetch all contests
export const fetchContests = async (): Promise<IContest[]> => {
  // Simulate API delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_CONTESTS);
    }, 500);
  });
};

// Fetch a specific contest by ID
export const fetchContestById = async (contestId: string): Promise<IContest | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const contest = MOCK_CONTESTS.find(c => c.id === contestId);
      resolve(contest || null);
    }, 300);
  });
};

// Mock videos for each contest
const CONTEST_VIDEOS: Record<string, IContestVideo[]> = {
  'f984ea94-a07e-4bff-a802-1694f51256045': [
    {
      id: '1',
      question: 'Will Manchester United score in the first half against Real Sociedad?',
      videoUrl: 'https://9shootnew.s3.us-east-1.amazonaws.com/murs1.mp4',
      thumbnailUrl: 'https://9shootnew.s3.us-east-1.amazonaws.com/ss1.png',
      contestId: 'f984ea94-a07e-4bff-a802-1694f51256045'
    },
    {
      id: '2',
      question: 'Will Real Sociedad keep a clean sheet?',
      videoUrl: 'https://9shootnew.s3.us-east-1.amazonaws.com/murs2.mp4',
      thumbnailUrl: 'https://9shootnew.s3.us-east-1.amazonaws.com/ss2.png',
      contestId: 'f984ea94-a07e-4bff-a802-1694f51256045'
    },
    {
      id: '3',
      question: 'Will there be more than 2 goals in the match?',
      videoUrl: 'https://9shootnew.s3.us-east-1.amazonaws.com/murs3.mp4',
      thumbnailUrl: 'https://9shootnew.s3.us-east-1.amazonaws.com/ss3.png',
      contestId: 'f984ea94-a07e-4bff-a802-1694f51256045'
    },
    {
      id: '4',
      question: 'Will Manchester United win the match?',
      videoUrl: 'https://9shootnew.s3.us-east-1.amazonaws.com/murs4.mp4',
      thumbnailUrl: 'https://9shootnew.s3.us-east-1.amazonaws.com/blur_img.png',
      contestId: 'f984ea94-a07e-4bff-a802-1694f51256045'
    }
  ],
  'f984ea94-a07e-4bff-a802': [
    {
      id: '1',
      question: 'Will Real Madrid score in the first 15 minutes?',
      videoUrl: 'https://9shootnew.s3.us-east-1.amazonaws.com/amrm1.mp4',
      thumbnailUrl: 'https://9shootnew.s3.us-east-1.amazonaws.com/realmadrid.png',
      contestId: 'f984ea94-a07e-4bff-a802'
    },
    {
      id: '2',
      question: 'Will Atletico Madrid get a red card?',
      videoUrl: 'https://9shootnew.s3.us-east-1.amazonaws.com/amrm2.mp4',
      thumbnailUrl: 'https://9shootnew.s3.us-east-1.amazonaws.com/athletico.png',
      contestId: 'f984ea94-a07e-4bff-a802'
    },
    {
      id: '3',
      question: 'Will the Madrid derby end in a draw?',
      videoUrl: 'https://9shootnew.s3.us-east-1.amazonaws.com/amrm3.mp4',
      thumbnailUrl: 'https://9shootnew.s3.us-east-1.amazonaws.com/realmadrid.png',
      contestId: 'f984ea94-a07e-4bff-a802'
    },
    {
      id: '4',
      question: 'Will both teams score?',
      videoUrl: 'https://9shootnew.s3.us-east-1.amazonaws.com/amrm4.mp4',
      thumbnailUrl: 'https://9shootnew.s3.us-east-1.amazonaws.com/athletico.png',
      contestId: 'f984ea94-a07e-4bff-a802'
    },
  ],
  'f984ea94-a07e-4bff-a802-1694f5125': [
    {
      id: '1',
      question: 'Will Liverpool score first against Manchester City?',
      videoUrl: 'https://9shootnew.s3.us-east-1.amazonaws.com/amrm1.mp4',
      thumbnailUrl: 'https://9shootnew.s3.us-east-1.amazonaws.com/liverpool.png',
      contestId: 'f984ea94-a07e-4bff-a802-1694f5125'
    },
    {
      id: '2',
      question: 'Will there be a penalty in the match?',
      videoUrl: 'https://9shootnew.s3.us-east-1.amazonaws.com/amrm2.mp4',
      thumbnailUrl: 'https://9shootnew.s3.us-east-1.amazonaws.com/mancity.png',
      contestId: 'f984ea94-a07e-4bff-a802-1694f5125'
    },
    {
      id: '3',
      question: 'Will Manchester City keep a clean sheet?',
      videoUrl: 'https://9shootnew.s3.us-east-1.amazonaws.com/amrm3.mp4',
      thumbnailUrl: 'https://9shootnew.s3.us-east-1.amazonaws.com/mancity.png',
      contestId: 'f984ea94-a07e-4bff-a802-1694f5125'
    }
  ]
};

// Fetch videos for a specific contest
export const fetchContestVideos = async (contestId: string): Promise<IContestVideo[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const videos = CONTEST_VIDEOS[contestId] || [];
      resolve(videos);
    }, 500);
  });
};

// Fetch a specific video by ID within a contest
export const fetchContestVideoById = async (contestId: string, videoId: string): Promise<IContestVideo | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const videos = CONTEST_VIDEOS[contestId] || [];
      const video = videos.find(v => v.id === videoId);
      resolve(video || null);
    }, 300);
  });
};

// Re-export IContest type for convenience
export type { IContest };
