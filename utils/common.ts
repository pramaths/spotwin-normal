import apiClient from "./api";
import { USER_BALANCE } from "../routes/api";
import { Share } from "react-native";

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


export const handleInvite = async (referralCode: string) => {
  const playStoreUrl = `https://play.google.com/store/apps/details?id=`;
  const appStoreUrl = `https://apps.apple.com/in/app/spotwin/id6743806381`;
  
  const message = `🏆 Ready to WIN IPL TICKETS? Join me on Spotwin! 🏆
  \n\nPredict questions, earn points, and redeem for IPL tickets! Use my referral code (${referralCode}) to get bonus points.
  \n\nJoin contests 🎮 → Earn points 🎯 → Buy tickets 🎟️\n\nDownload now:\n
  ios: ${appStoreUrl}
  android: ${playStoreUrl}`;
  try {
    await Share.share({ message });
  } catch (error) {
    console.error('Error sharing:', error);
  }
};