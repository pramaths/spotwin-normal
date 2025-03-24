const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL as string;
export const LOGIN = `${backendUrl}/auth/login`;
export const LOGOUT = `${backendUrl}/auth/logout`;

//sports
export const SPORTS = `${backendUrl}/api/sports`;

//contests
export const CONTESTS = `${backendUrl}/contests/active`;
export const CONTESTS_BY_ID = (id: string) => `${backendUrl}/contests/${id}`;


//questions
export const QUESTIONS =(id: string) => `${backendUrl}/submission/user/${id}`;
export const QUESTIONS_BY_CONTEST = (contestId: string) => `${backendUrl}/questions/contest/${contestId}`;

//user
export const USER =(id: string) => `${backendUrl}/users/${id}`;
export const USER_BALANCE = (userId: string) => `${backendUrl}/users/${userId}/balance`;
export const CHANGE_USERNAME = (userId: string) => `${backendUrl}/users/${userId}`;
export const UPDATE_EXPO_PUSH_TOKEN = (userId: string) => `${backendUrl}/users/${userId}`;

//UserContests
export const USER_CONTESTS =(userId: string)=> `${backendUrl}/user-contests/user/${userId}`;
export const USER_PARTICIPATION =(userId: string)=> `${backendUrl}/user-contests/user/${userId}/participation`;
export const JOIN_CONTEST = `${backendUrl}/user-contests/join`;

//Prediction
export const SUBMIT_PREDICTION = `${backendUrl}/predictions`;
export const GET_ALL_QUESTIONS_BY_CONTEST = (contestId: string) => `${backendUrl}/featured/contest/${contestId}`;
export const REMOVE_PREDICTION_API = (videoId: string, userId: string) => `${backendUrl}/predictions/video/${videoId}/user/${userId}`;
export const GET_BY_A_PREDICTION = (predictionId: string) => `${backendUrl}/predictions/${predictionId}`;
export const GET_PREDICTION_BY_USER_AND_CONTEST =( contestId: string, userId: string) => `${backendUrl}/predictions/${contestId}/user/${userId}`;


//leaderboard
export const LEADERBOARD_API = (contestId: string) => `${backendUrl}/leaderboard/${contestId}`;
