// API Configuration for Railway Deployment
const BASE_URL_RAW = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
// Remove trailing slash to prevent double slashes
const BASE_URL = BASE_URL_RAW.endsWith('/') ? BASE_URL_RAW.slice(0, -1) : BASE_URL_RAW;

export const API_CONFIG = {
  BASE_URL,
  ENDPOINTS: {
    UPLOAD: '/upload',
    CANDIDATES: '/api/candidates',
    CANDIDATE_BY_ID: '/candidate',
    HEALTH: '/health'
  }
};

export const getApiUrl = (endpoint: string) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
}; 