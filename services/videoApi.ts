import { GET_ALL_QUESTIONS_BY_CONTEST, SUBMIT_PREDICTION, REMOVE_PREDICTION, GET_BY_A_PREDICTION, GET_PREDICTION_BY_USER_AND_CONTEST } from "../routes/api";
import apiClient from "@/utils/api";
import { OutcomeType } from "@/types";
import { IUserPrediction } from "@/components/UserPredictions";

export interface IFeaturedVideo {
  id: string;
  question: string;
  videoUrl: string;
  thumbnailUrl: string;
  userId: string;
  contestId: string;
  correctOutcome: string | null;
  numberOfBets: number;
  createdAt: string;
  updatedAt: string;
}


export const fetchFeaturedVideos = async (contestId: string): Promise<IFeaturedVideo[]> => {
  try {
    const response = await apiClient(GET_ALL_QUESTIONS_BY_CONTEST(contestId), "GET");
    if (response.success && response.data) {
      return response.data as IFeaturedVideo[];
    } else {
      console.error("Error fetching featured videos:", response.message);
      return [];
    }
  } catch (error) {
    console.error("Error fetching featured videos:", error);
    return [];
  }
};


export const submitPrediction = async (
  videoId: string,
  contestId: string,
  userId: string,
  prediction: OutcomeType
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient(SUBMIT_PREDICTION, "POST", {
      videoId,
      contestId,
      userId,
      prediction
    });
    if (response.success) {
      return { success: true, message: "Prediction submitted successfully" };
    } else {
      return { success: false, message: response.message || "An error occurred" };
    }
  } catch (error) {
    console.error("Error submitting prediction:", error);
    return { success: false, message: "An error occurred" };
  }
  
};

export const RemovePrediction = async (predictionId: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient(REMOVE_PREDICTION(predictionId), "DELETE");
    if (response.success) {
      return { success: true, message: "Prediction removed successfully" };
    } else {
      return { success: false, message: response.message || "An error occurred" };
    }
  } catch (error) {
    console.error("Error removing prediction:", error);
    return { success: false, message: "An error occurred" };
  }
}

export const fetchUserPredictions = async (contestId: string, userId?: string): Promise<IUserPrediction[]> => {
  try {
    const response = await apiClient<IUserPrediction[]>(GET_PREDICTION_BY_USER_AND_CONTEST(contestId, userId || ''), 'GET');
    console.log('response', response);
    if (response.success && response.data) {
      return response.data.map((prediction: IUserPrediction) => ({
        ...prediction,
        question: prediction.video.question || '',
        thumbnailUrl: prediction.video.thumbnailUrl,
        outcome: prediction.prediction === 'YES' ? OutcomeType.YES : OutcomeType.NO
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching user predictions:', error);
    throw new Error('Failed to fetch predictions');
  }
};


