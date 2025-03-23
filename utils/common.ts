import apiClient from "./api";
import { USER_BALANCE } from "../routes/api";

export const getUserBalance = async (userId: string) => {
  if (!userId) {
    throw new Error("User ID is required");
  }
  try {
    const response = await apiClient<{ balance: number }>(USER_BALANCE(userId), "GET");
    if (response.success && response.data) {
      return response.data?.balance;
    } else {
      throw new Error(response.message);
    }
  } catch (error) {
    console.error("Error in getUserBalance:", error);
    throw error;
  }
};
