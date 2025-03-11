import { GET_ALL_QUESTIONS_BY_CONTEST, SUBMIT_PREDICTION } from "../routes/api";
import apiClient from "@/utils/api";
import { OutcomeType } from "@/types";

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
