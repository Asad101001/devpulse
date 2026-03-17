import axios from 'axios';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || '') + '/api/v1',
});

// Attach JWT to every request automatically
let _token = null;

/**
 * Update the global axios API instance with the JWT token
 * @param {string} t - JWT token
 */
export const setToken = (t) => {
  _token = t;
};

api.interceptors.request.use((config) => {
  if (_token) {
    config.headers.Authorization = `Bearer ${_token}`;
  }
  return config;
});

export default api;
