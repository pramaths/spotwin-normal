const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL as string;
export const LOGIN = `${backendUrl}/auth/login`;
export const LOGOUT = `${backendUrl}/auth/logout`;

//sports
export const SPORTS = `${backendUrl}/api/sports`;

//contests
export const CONTESTS = `${backendUrl}/contests`;
export const CONTESTS_BY_ID = (id: string) => `${backendUrl}/contests/${id}`;


//questions
export const QUESTIONS =(id: string) => `${backendUrl}/submission/user/${id}`;

//user
export const USER =(publicAddress: string) => `${backendUrl}/users/address/${publicAddress}`;


//submission
export const SUBMISSION = `${backendUrl}/submission`;

//UserContests
export const USER_CONTESTS =(userId: string)=> `${backendUrl}/user-contests/user/${userId}`;

// ative contest with videos
export const ACTIVE_CONTEST_WITH_VIDEOS = `${backendUrl}/contests/active`;


//Prediction
export const SUBMIT_PREDICTION = `${backendUrl}/predictions`;
export const GET_ALL_QUESTIONS_BY_CONTEST = (contestId: string) => `${backendUrl}/featured/contest/${contestId}`;
export const REMOVE_PREDICTION = (predictionId: string) => `${backendUrl}/predictions/${predictionId}`;
export const GET_BY_A_PREDICTION = (predictionId: string) => `${backendUrl}/predictions/${predictionId}`;
export const GET_PREDICTION_BY_USER_AND_CONTEST =( contestId: string, userId: string) => `${backendUrl}/predictions/${contestId}/user/${userId}`;