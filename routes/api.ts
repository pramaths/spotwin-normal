const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL as string;
console.log(backendUrl);
export const LOGIN = `${backendUrl}/auth/login`;
export const LOGOUT = `${backendUrl}/auth/logout`;

//sports
export const SPORTS = `${backendUrl}/api/sports`;
export const SPORTS_BY_ID = `${backendUrl}/api/sports/:id`;

//contests
export const CONTESTS = `${backendUrl}/contests`;

export const CONTESTS_BY_ID = `${backendUrl}/api/contests/:id`;



//questions
export const QUESTIONS =(id: string) => `${backendUrl}/questions/${id}`;

//user
export const USER =(publicAddress: string) => `${backendUrl}/users/address/${publicAddress}`;


