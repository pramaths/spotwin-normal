const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL as string;

//auth
export const LOGIN = `${backendUrl}/auth/login`;
export const LOGOUT = `${backendUrl}/auth/logout`;
export const AUTH_ME = `${backendUrl}/auth/me`;

//sports
export const SPORTS = `${backendUrl}/api/sports`;

//contests
export const CONTESTS = `${backendUrl}/contests/active`;
export const CONTESTS_BY_ID = (id: string) => `${backendUrl}/contests/${id}`;


//questions
export const QUESTIONS =(id: string) => `${backendUrl}/submission/user/${id}`;
export const QUESTIONS_BY_CONTEST = (contestId: string) => `${backendUrl}/questions/contest/${contestId}`;

export const USER_BALANCE = (userId: string) => `${backendUrl}/users/${userId}/balance`;
export const CHANGE_USERNAME = (userId: string) => `${backendUrl}/users/${userId}`;
export const UPDATE_EXPO_PUSH_TOKEN = (userId: string) => `${backendUrl}/users/${userId}/expo-push-token`;
export const GET_ALL_TICKETS = `${backendUrl}/tickets`;
export const BUY_TICKET = `${backendUrl}/users/buy-ticket`;

//UserContests
export const USER_CONTESTS = `${backendUrl}/user-contests/user`;
export const USER_PARTICIPATION =(userId: string)=> `${backendUrl}/user-contests/user/${userId}/participation`;
export const JOIN_CONTEST = `${backendUrl}/user-contests/join`;

//Prediction
export const SUBMIT_PREDICTION = `${backendUrl}/predictions`;
export const REMOVE_PREDICTION = (questionId: string, userId: string) => `${backendUrl}/predictions/question/${questionId}/user/${userId}`;
export const CHANGE_PREDICTION = (questionId: string, userId: string) => `${backendUrl}/predictions/question/${questionId}/user/${userId}`;
export const UPDATE_PREDICTION = (predictionId: string) => `${backendUrl}/predictions/${predictionId}`;
export const GET_BY_A_PREDICTION = (predictionId: string) => `${backendUrl}/predictions/${predictionId}`;
export const GET_PREDICTION_BY_USER_AND_CONTEST =( contestId: string, userId: string) => `${backendUrl}/predictions/${contestId}/user/${userId}`;
export const GET_ALL_QUESTIONS_BY_CONTEST = (contestId: string) => `${backendUrl}/featured/contest/${contestId}`;
export const SUBMIT_PREDICTIONS = `${backendUrl}/predictions/submit/onchain`;

//leaderboard
export const LEADERBOARD_API = (contestId: string) => `${backendUrl}/leaderboards/contest/${contestId}`;

//referral
export const REFERRAL_CODE = (userId: string) => `${backendUrl}/users/${userId}/referral-code-used`;


//stake
export const STAKE = `${backendUrl}/users/stake`;
