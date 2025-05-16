import { Share } from "react-native";

export const handleInvite = async (referralCode: string) => {
  const playStoreUrl = `https://play.google.com/store/apps/details?id=`;
  const appStoreUrl = `https://apps.apple.com/in/app/spotwin/id6743806381`;
  
  const message = `🔥 Join Spotwin’s live sports trivia! 🔥

Answer fast-fire questions on Cricket, Football & Basketball to enter contests using USD or SPOT—and win USD rewards!  
Stake SPOT to unlock bonus questions & earn extra points.

Use my code (${referralCode}) for bonus points at signup!

▶️ Play now:
iOS: ${appStoreUrl}
Android: ${playStoreUrl}`;

  try {
    await Share.share({ message });
  } catch (error) {
    console.error('Error sharing:', error);
  }
};


