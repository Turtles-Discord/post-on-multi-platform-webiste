import api from '../services/api';
const API_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000/api'
    : process.env.REACT_APP_API_URL
});

// Add request interceptor to include token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const signup = async (userData) => {
  try {
    console.log('Attempting signup with data:', userData);
    const response = await api.post('/auth/signup', userData);
    console.log('Signup response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Detailed signup error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    });
    throw new Error(error.response?.data?.message || 'Signup failed');
  }
};


export const login = async (credentials) => {
  try {
    console.log('Attempting login with:', credentials);
    const response = await api.post('/auth/login', credentials);
    console.log('Login response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

// Account endpoints
export const connectPlatform = async (platform, accountNumber) => {
  try {
    const response = await fetch(`${API_URL}/accounts/connect/${platform}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ accountNumber }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to connect ${platform}`);
    }
    
    return await response.json();
  } catch (error) {
    throw new Error(error.message || `Failed to connect ${platform}`);
  }
};

export const getAccounts = async () => {
  try {
    const response = await fetch(`${API_URL}/accounts`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch accounts');
    }
    
    return await response.json();
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch accounts');
  }
};

// Post endpoints
export const createPost = async (formData) => {
  try {
    const response = await fetch(`${API_URL}/post`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create post');
    }
    
    return await response.json();
  } catch (error) {
    throw new Error(error.message || 'Failed to create post');
  }
};

export const getPostHistory = async (page = 1, limit = 10) => {
  try {
    const response = await fetch(`${API_URL}/post/history?page=${page}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch post history');
    }
    
    return await response.json();
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch post history');
  }
}; 