/**
 * API Service - Centralized API calls for the frontend
 */

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');

/**
 * Base fetch wrapper with error handling
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || 'Request failed');
    }

    return data;
  } catch (error) {
    // Handle network errors
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error('Network error. Please check your connection.');
    }
    throw error;
  }
}

/**
 * Auth API
 */
export const authApi = {
  async login(email, password) {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async register(email, password, confirmPassword) {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, confirmPassword }),
    });
  },
};

/**
 * URL API
 */
export const urlApi = {
  async shorten(originalUrl, customAlias = null) {
    const body = { originalUrl };
    if (customAlias) body.customAlias = customAlias;

    return apiRequest('/shorten', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  async getAll() {
    return apiRequest('/urls');
  },

  async delete(shortId) {
    return apiRequest(`/urls/${shortId}`, {
      method: 'DELETE',
    });
  },

  async recover(shortId) {
    return apiRequest(`/urls/${shortId}/recover`, {
      method: 'POST',
    });
  },

  async updateAlias(shortId, customAlias) {
    return apiRequest(`/urls/${shortId}/alias`, {
      method: 'PUT',
      body: JSON.stringify({ customAlias }),
    });
  },

  async getStats(shortId) {
    return apiRequest(`/urls/${shortId}/stats`);
  },

  async transfer(urls) {
    return apiRequest('/urls/transfer', {
      method: 'POST',
      body: JSON.stringify({ urls }),
    });
  },
};

/**
 * Health API
 */
export const healthApi = {
  async check() {
    return apiRequest('/health');
  },
};

export default {
  auth: authApi,
  url: urlApi,
  health: healthApi,
};
