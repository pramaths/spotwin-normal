// videoApi.ts
import { Platform } from 'react-native';

export interface IFeaturedVideo {
  id: string;
  question: string;
  videoUrl: string;
}

// Sample video data
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
  {
    id: '4',
    question: 'Will the match end in a draw?',
    videoUrl: Platform.OS === 'web' ? 'https://www.youtube.com/shorts/y02mOQudT3E' : 
      'https://s3.ap-south-1.amazonaws.com/sizzils3/0b5233d2-f1db-4714-bcfe-bfe33dcba6aa-nvidia_5T_mcap.mp4',
  },
];

/**
 * Simulates fetching featured videos from an API
 * @returns Promise that resolves to an array of featured videos
 */
export const fetchFeaturedVideos = async (): Promise<IFeaturedVideo[]> => {
  // Simulate network delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...SAMPLE_VIDEOS]);
    }, 500);
  });
};

/**
 * Simulates fetching a single video by ID
 * @param id The ID of the video to fetch
 * @returns Promise that resolves to a featured video or null if not found
 */
export const fetchVideoById = async (id: string): Promise<IFeaturedVideo | null> => {
  // Simulate network delay
  return new Promise((resolve) => {
    setTimeout(() => {
      const video = SAMPLE_VIDEOS.find(video => video.id === id);
      resolve(video || null);
    }, 300);
  });
};

/**
 * Simulates submitting a prediction for a video
 * @param videoId The ID of the video
 * @param prediction The user's prediction ('yes' or 'no')
 * @returns Promise that resolves to a success message
 */
export const submitPrediction = async (
  videoId: string, 
  prediction: 'yes' | 'no'
): Promise<{ success: boolean; message: string }> => {
  // Simulate network delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: `Successfully submitted ${prediction} prediction for video ${videoId}`
      });
    }, 300);
  });
};
