import api from '../services/api';
const API_URL = process.env.REACT_APP_API_URL;




// Auth endpoints
export const signup = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Signup failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Signup error:', error.message);
    throw new Error(error.message || 'Signup failed');
  }
};

export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
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