import apiService from '../config/api';

const TOKEN_KEY = 'mlr_access_token';
const REFRESH_TOKEN_KEY = 'mlr_refresh_token';
const USER_KEY = 'mlr_user';

export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setRefreshToken = (refreshToken) => {
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const getRefreshToken = () => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setUser = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUser = () => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await apiService.refreshToken(refreshToken);
  const { token, refreshToken: newRefreshToken } = response.data;
  
  setToken(token);
  setRefreshToken(newRefreshToken);
  
  return token;
};

export const isAuthenticated = () => {
  return !!getToken();
};