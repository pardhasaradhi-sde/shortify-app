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
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  // Handle 401 Unauthorized
  if (response.status === 401) {
    removeToken();
    removeUser();
    window.location.href = '/';
    throw new Error('Unauthorized');
  }

  // Handle 429 Rate Limit Exceeded
  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After');
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    const limit = data.limit || response.headers.get('X-RateLimit-Limit') || 'your';
    const retrySeconds = data.retryAfter || retryAfter || 60;
    const minutes = Math.ceil(retrySeconds / 60);
    throw new Error(
      `Rate limit exceeded. You've hit the limit of ${limit} requests. ` +
        `Please try again in ${minutes} minute${minutes > 1 ? 's' : ''}.`
    );
  }

  // Handle 204 No Content
  if (response.status === 204) return null;

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Request failed');
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
  create: async (originalUrl, customAlias = '') => {
    return apiRequest('/api/urls', {
      method: 'POST',
      body: JSON.stringify({
        originalUrl,
        ...(customAlias && { customAlias }),
      }),
    });
  },

  getAll: async () => {
    return apiRequest('/api/urls');
  },

  delete: async (id) => {
    return apiRequest(`/api/urls/${id}`, { method: 'DELETE' });
  },

  getAnalytics: async (shortCode) => {
    return apiRequest(`/api/urls/${shortCode}/analytics`);
  },

  getQrCodeUrl: (shortCode) => {
    const token = getToken();
    // Return a URL that when opened, downloads the QR PNG
    return `${API_BASE_URL}/api/urls/${shortCode}/qr?token=${token}`;
  },

  downloadQr: async (shortCode) => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/urls/${shortCode}/qr`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to download QR code');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-${shortCode}.png`;
    a.click();
    window.URL.revokeObjectURL(url);
  },
};

export default { authApi, urlApi };
