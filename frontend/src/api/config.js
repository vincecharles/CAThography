const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const endpoints = {
  routes: `${API_URL}/api/routes`,
  stops: `${API_URL}/api/stops`,
  fares: `${API_URL}/api/fares`,
  auth: `${API_URL}/api/auth`,
  informal: `${API_URL}/api/informal`
}; 