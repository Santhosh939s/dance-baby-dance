import axios from 'axios';

// During development, proxy to localhost:5000 if not set
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const searchYouTube = async (query) => {
  try {
    const response = await api.get(`/youtube/search?q=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error('Error searching YouTube:', error);
    throw error;
  }
};

export const checkYouTubeConnection = async (uid) => {
  try {
    const response = await api.get(`/oauth/status?uid=${encodeURIComponent(uid)}`);
    return response.data.connected;
  } catch (error) {
    console.error('Error checking YouTube connection:', error);
    return false;
  }
};

