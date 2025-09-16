//export const API_URL = "http://localhost:3000/api"; // URL base de la API (Desarrollo)
export const API_URL = (process.env.REACT_APP_API_URL + "/api") as string; // URL base de la API (Producción)
export const ACCESS_TOKEN_KEY = 'accessToken';
export const REFRESH_TOKEN_KEY = 'refreshToken';
export const USER_DATA_KEY = 'user';