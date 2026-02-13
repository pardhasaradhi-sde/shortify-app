// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Token management
export const getToken = () => localStorage.getItem('auth_token');
export const setToken = (token) => localStorage.setItem('auth_token', token);
export const removeToken = () => localStorage.removeItem('auth_token');

// User management
export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};
export const setUser = (user) => localStorage.setItem('user', JSON.stringify(user));
export const removeUser = () => localStorage.removeItem('user');

// Generic API request handler
async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  // Handle 401 Unauthorized
  if (response.status === 401) {
    removeToken();
    removeUser();
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

// Auth API
export const authApi = {
  register: async (email, password) => {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (data.token) {
      setToken(data.token);
      setUser({ email: data.email, role: data.role });
    }
    
    return data;
  },

  login: async (email, password) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (data.token) {
      setToken(data.token);
      setUser({ email: data.email, role: data.role });
    }
    
    return data;
  },

  logout: () => {
    removeToken();
    removeUser();
  },
};

// URL API
export const urlApi = {
  create: async (originalUrl) => {
    return apiRequest('/api/urls', {
      method: 'POST',
      body: JSON.stringify({ originalUrl }),
    });
  },

  getAll: async () => {
    return apiRequest('/api/urls');
  },

  delete: async (id) => {
    return apiRequest(`/api/urls/${id}`, {
      method: 'DELETE',
    });
  },
};

export default { authApi, urlApi };
