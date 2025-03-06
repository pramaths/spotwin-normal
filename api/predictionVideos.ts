import { IFeaturedVideo, IFeaturedVideos, IOutcomeType } from '@/types';

// Sample data for development
const SAMPLE_VIDEOS: IFeaturedVideo[] = [
  {
    id: '1',
    question: 'Will Manchester United score in the first half?',
    videoUrl: 'https://s3.ap-south-1.amazonaws.com/sizzils3/f367fad1-aff4-4a12-8e07-f0dbd0184b7e-perplexity.mp4',
  },
  {
    id: '2',
    question: 'Will Liverpool win the match?',
    videoUrl: 'https://s3.ap-south-1.amazonaws.com/sizzils3/f367fad1-aff4-4a12-8e07-f0dbd0184b7e-perplexity.mp4',
  },
  {
    id: '3',
    question: 'Will the match end in a draw?',
    videoUrl: 'https://s3.ap-south-1.amazonaws.com/sizzils3/0b5233d2-f1db-4714-bcfe-bfe33dcba6aa-nvidia_5T_mcap.mp4',
  },
];

// Sample user predictions for development
export interface IUserPrediction {
  id: string;
  videoId: string;
  question: string;
  thumbnailUrl: string;
  outcome: IOutcomeType;
  videoUrl: string;
}

const SAMPLE_USER_PREDICTIONS: Record<string, IUserPrediction[]> = {
  'f984ea94-a07e-4bff-a802-1694f5125604': [
    {
      id: 'pred1',
      videoId: '1',
      question: 'Will Manchester United score in first half?',
      thumbnailUrl: 'https://s3.ap-south-1.amazonaws.com/sizzils3/5829da6d-3660-43b2-a6df-2d2e775a29b3-Men\'s_Champions_Trophy.png',
      outcome: IOutcomeType.YES,
      videoUrl: 'https://s3.ap-south-1.amazonaws.com/sizzils3/f367fad1-aff4-4a12-8e07-f0dbd0184b7e-perplexity.mp4',
    },
    {
      id: 'pred2',
      videoId: '2',
      question: 'Will there be a red card?',
      thumbnailUrl: 'https://s3.ap-south-1.amazonaws.com/sizzils3/5829da6d-3660-43b2-a6df-2d2e775a29b3-Men\'s_Champions_Trophy.png',
      outcome: IOutcomeType.NO,
      videoUrl: 'https://s3.ap-south-1.amazonaws.com/sizzils3/f367fad1-aff4-4a12-8e07-f0dbd0184b7e-perplexity.mp4',
    },
    {
      id: 'pred3',
      videoId: '3',
      question: 'Will Vinicius Jr. score?',
      thumbnailUrl: 'https://s3.ap-south-1.amazonaws.com/sizzils3/5829da6d-3660-43b2-a6df-2d2e775a29b3-Men\'s_Champions_Trophy.png',
      outcome: IOutcomeType.YES,
      videoUrl: 'https://s3.ap-south-1.amazonaws.com/sizzils3/0b5233d2-f1db-4714-bcfe-bfe33dcba6aa-nvidia_5T_mcap.mp4',
    }
  ],
  'a984ea94-a07e-4bff-a802-1694f5125605': [
    {
      id: 'pred4',
      videoId: '4',
      question: 'Will the match have over 2.5 goals?',
      thumbnailUrl: 'https://s3.ap-south-1.amazonaws.com/sizzils3/5829da6d-3660-43b2-a6df-2d2e775a29b3-Men\'s_Champions_Trophy.png',
      outcome: IOutcomeType.YES,
      videoUrl: 'https://s3.ap-south-1.amazonaws.com/sizzils3/f367fad1-aff4-4a12-8e07-f0dbd0184b7e-perplexity.mp4',
    },
    {
      id: 'pred5',
      videoId: '5',
      question: 'Will there be a penalty kick?',
      thumbnailUrl: 'https://s3.ap-south-1.amazonaws.com/sizzils3/5829da6d-3660-43b2-a6df-2d2e775a29b3-Men\'s_Champions_Trophy.png',
      outcome: IOutcomeType.NO,
      videoUrl: 'https://s3.ap-south-1.amazonaws.com/sizzils3/0b5233d2-f1db-4714-bcfe-bfe33dcba6aa-nvidia_5T_mcap.mp4',
    }
  ]
};

/**
 * Fetch prediction videos for a specific event or contest
 * In a real application, this would make an API call to a backend server
 */
export const fetchPredictionVideos = async (
  eventId?: string,
  contestId?: string
): Promise<IFeaturedVideo[]> => {
  // In a real app, we would make a fetch call to the API here
  // For development, we're returning the sample data
  
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return the sample data
  return SAMPLE_VIDEOS;
};

/**
 * Submit a prediction for a specific video
 */
export const submitPrediction = async (
  videoId: string,
  prediction: string
): Promise<{ success: boolean; message: string }> => {
  // In a real app, we would make a POST request to submit the prediction
  
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return success response
  return {
    success: true,
    message: 'Prediction submitted successfully',
  };
};

/**
 * Fetch user predictions for a specific contest
 * @param contestId The ID of the contest
 * @param userId The ID of the user (optional in this mock implementation)
 */
export const fetchUserPredictions = async (
  contestId: string,
  userId?: string
): Promise<IUserPrediction[]> => {
  // In a real app, we would make a fetch call with userId and contestId
  
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return sample predictions for the contest
  return SAMPLE_USER_PREDICTIONS[contestId] || [];
};

/**
 * Update a user prediction
 */
export const updateUserPrediction = async (
  predictionId: string,
  outcome: IOutcomeType
): Promise<{ success: boolean; message: string }> => {
  // In a real app, we would make a PUT/PATCH request to update the prediction
  
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return success response
  return {
    success: true,
    message: 'Prediction updated successfully',
  };
};
