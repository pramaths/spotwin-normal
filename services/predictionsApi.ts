import { GET_ALL_QUESTIONS_BY_CONTEST, SUBMIT_PREDICTION, REMOVE_PREDICTION, GET_PREDICTION_BY_USER_AND_CONTEST, UPDATE_PREDICTION } from "../routes/api";
import apiClient from "@/utils/api";
import { IOutcome, IQuestion, IUserPrediction } from "@/types";

export const fetchQuestionsByContest = async (contestId: string): Promise<IQuestion[]> => {
  try {
    const response = await apiClient(GET_ALL_QUESTIONS_BY_CONTEST(contestId), "GET");
    if (response.success && response.data) {
      return response.data as IQuestion[];
    } else {
      console.error("Error fetching questions by contest:", response.message);
      return [];
    }
  } catch (error) {
    console.error("Error fetching questions by contest:", error);
    return [];
  }
};


export const submitPrediction = async (
  questionId: string,
  contestId: string,
  userId: string,
  prediction: IOutcome
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient(SUBMIT_PREDICTION, "POST", {
      questionId,
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

export const fetchUserPredictions = async (contestId: string, userId?: string): Promise<IUserPrediction[]> => {
  try {
    const response = await apiClient<IUserPrediction[]>(GET_PREDICTION_BY_USER_AND_CONTEST(contestId, userId || ''), 'GET');
    if (response.success && response.data) {
      return response.data.map((prediction: IUserPrediction) => ({
        ...prediction,
        question: prediction.question || '',
        outcome: prediction.prediction === 'YES' ? IOutcome.YES : IOutcome.NO
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching user predictions:', error);
    throw new Error('Failed to fetch predictions');
  }
};

export const RemovePrediction = async(questionId: string, userId: string):Promise<{success: boolean, message: string}> => {
  try {
    const response = await apiClient(REMOVE_PREDICTION(questionId, userId), "DELETE");
    if (response.success) {
      return { success: true, message: "Prediction removed successfully" };
    } else {
      return { success: false, message: "An error occurred" };
    }
  } catch (error) {
    console.error('Error removing prediction:', error);
    return { success: false, message: "An error occurred" };
  }
}

  export const ChangePrediction = async(predictionId: string, prediction: IOutcome, questionId: string):Promise<{success: boolean, message: string}> => {
    try {
      const response = await apiClient(UPDATE_PREDICTION(predictionId), "PATCH", {
        prediction,
        questionId,
      });
      if (response.success) {
        return { success: true, message: "Prediction changed successfully" };
      } else {
        return { success: false, message: "An error occurred" };
      }
    } catch (error) {
      console.error('Error changing prediction:', error);
      return { success: false, message: "An error occurred" };
    }
  }

