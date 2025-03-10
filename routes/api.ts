const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL as string;
export const LOGIN = `${backendUrl}/api/auth/login`;
export const LOGOUT = `${backendUrl}/api/auth/logout`;

//sports
export const SPORTS = `${backendUrl}/api/sports`;
export const SPORTS_BY_ID = `${backendUrl}/api/sports/:id`;

//contests
export const CONTESTS = `${backendUrl}/contests`;

export const CONTESTS_BY_ID = `${backendUrl}/api/contests/:id`;

