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
    videoUrl: 'https://9shootnew.s3.us-east-1.amazonaws.com/amrm2.mp4',
  },
  {
    id: '2',
    question: 'Will Liverpool win the match?',
    videoUrl: 'https://9shootnew.s3.us-east-1.amazonaws.com/amrm3.mp4',
  },
  {
    id: '3',
    question: 'Will the match end in a draw?',
    videoUrl: 'https://9shootnew.s3.us-east-1.amazonaws.com/amrm1.mp4',
  },
  {
    id: '4',
    question: 'Will the match end in a draw?',
    videoUrl: 'https://9shootnew.s3.us-east-1.amazonaws.com/amrm4.mp4',
  },
  {
    id: '5',
    question: 'Will the match end in a draw?',
    videoUrl: 'https://9shootnew.s3.us-east-1.amazonaws.com/amrm5.mp4',
  },
];


const SAMPLE_VIDEOS_2 = [
  {
    id: '1',
    question: 'Will Manchester United score in the first half?',
    videoUrl: 'https://9shootnew.s3.us-east-1.amazonaws.com/murs1.mp4',
  },
  {
    id: '2',
    question: 'Will Manchester United score in the first half?',
    videoUrl: 'https://9shootnew.s3.us-east-1.amazonaws.com/murs2.mp4',
  },
  {
    id: '3',
    question: 'Will Manchester United score in the first half?',
    videoUrl: 'https://9shootnew.s3.us-east-1.amazonaws.com/murs3.mp4',
  },
  {
    id: '4',
    question: 'Will Manchester United score in the first half?',
    videoUrl: 'https://9shootnew.s3.us-east-1.amazonaws.com/murs4.mp4',
  }
]

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
