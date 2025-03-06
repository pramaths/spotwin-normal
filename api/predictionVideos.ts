import { IFeaturedVideo, IFeaturedVideos } from '@/types';

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
