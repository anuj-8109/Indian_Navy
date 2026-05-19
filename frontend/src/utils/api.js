const API_BASE = 'http://localhost:5000/api';

export const setToken = (token) => {
  if (token) {
    localStorage.setItem('navy_token', token);
  } else {
    localStorage.removeItem('navy_token');
  }
};

export const getToken = () => localStorage.getItem('navy_token');

export const apiFetch = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = options.headers || {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If body is not FormData, set Content-Type JSON
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    if (typeof options.body === 'object') {
      options.body = JSON.stringify(options.body);
    }
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('navy_token');
        localStorage.removeItem('navy_user');
        window.dispatchEvent(new Event('auth_failed'));
      }
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error(`API Fetch Error [${endpoint}]:`, error);
    throw error;
  }
};
