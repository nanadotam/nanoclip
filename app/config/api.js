export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Helper function for clip endpoints
export const ENDPOINTS = {
  clips: `${API_BASE_URL}/clips`,
  download: (filename) => `${API_BASE_URL}/clips?download=1&filename=${filename}`
}; 