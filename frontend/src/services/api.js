/**
 * Resolves the API base URL dynamically.
 * Priority order:
 * 1. User/Runtime configured override stored in localStorage ('bloodlink_api_url')
 * 2. Injected define from vite.config.js (__BLOODLINK_API_URL__)
 * 3. Any Vite environment variable (VITE_API_URL, VITE_BACKEND_URL, etc.)
 * 4. Automatic heuristic: if running on a Vercel frontend (*-frontend.vercel.app),
 *    infer the corresponding backend URL (*-backend.vercel.app)
 * 5. Local development fallback: '/api' (proxied by vite.config.js to http://localhost:5000)
 */
export const getApiBase = () => {
  // 1. Check runtime localStorage override
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem('bloodlink_api_url');
      if (saved && typeof saved === 'string' && saved.trim()) {
        const clean = saved.trim().replace(/\/+$/, '');
        return clean.endsWith('/api') ? clean : `${clean}/api`;
      }
    }
  } catch (e) {}

  // 2. Check build-time injected define from vite.config.js
  let buildTimeUrl = '';
  try {
    if (typeof __BLOODLINK_API_URL__ !== 'undefined' && __BLOODLINK_API_URL__) {
      buildTimeUrl = __BLOODLINK_API_URL__;
    }
  } catch (e) {}

  // 3. Check all possible Vite environment variables
  const envUrl =
    buildTimeUrl ||
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_BACKEND_URL ||
    import.meta.env.VITE_BACKEND_LINK ||
    import.meta.env.VITE_BACKEND_LINKS ||
    import.meta.env.VITE_SERVER_URL ||
    import.meta.env.VITE_API_BASE ||
    '';

  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    const clean = envUrl.trim().replace(/\/+$/, '');
    return clean.endsWith('/api') ? clean : `${clean}/api`;
  }

  // 4. Auto-infer backend URL if deployed on a standard Vercel frontend domain
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    if (hostname.includes('-frontend.vercel.app')) {
      const inferred = `https://${hostname.replace('-frontend.vercel.app', '-backend.vercel.app')}/api`;
      return inferred;
    }
  }

  // 5. Default relative path for local development
  return '/api';
};

// Dynamic API_BASE object whose string evaluation runs getApiBase() on every request
export const API_BASE = {
  toString: () => getApiBase(),
};

const getHeaders = () => {
  const token = localStorage.getItem('bloodlink_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    let errorMsg = data.message;
    if (!errorMsg) {
      if (res.status === 405) {
        errorMsg = `Request failed with status 405 (Method Not Allowed). The frontend is sending API requests to the static frontend server (${res.url}) instead of your backend. Please set VITE_API_URL to your deployed backend URL in Vercel and redeploy, or click "Connect Backend" in the top banner.`;
      } else if (res.status === 404) {
        errorMsg = `Endpoint not found (404) at ${res.url}. Verify that your backend is deployed and that VITE_API_URL is configured in Vercel.`;
      } else {
        errorMsg = `Request failed with status ${res.status}`;
      }
    }
    const err = new Error(errorMsg);
    err.data = data;
    throw err;
  }
  return data;
};

export const api = {
  // Auth
  auth: {
    register: (body) =>
      fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body),
      }).then(handleResponse),

    login: (body) =>
      fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body),
      }).then(handleResponse),

    getMe: () =>
      fetch(`${API_BASE}/auth/me`, {
        method: 'GET',
        headers: getHeaders(),
      }).then(handleResponse),

    getSetupStatus: () =>
      fetch(`${API_BASE}/auth/setup-status`).then(handleResponse),

    setupAdmin: (body) =>
      fetch(`${API_BASE}/auth/setup-admin`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body),
      }).then(handleResponse),
  },

  // Donor
  donor: {
    getProfile: () =>
      fetch(`${API_BASE}/donor/profile`, {
        headers: getHeaders(),
      }).then(handleResponse),

    updateProfile: (body) =>
      fetch(`${API_BASE}/donor/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(body),
      }).then(handleResponse),

    checkEligibility: () =>
      fetch(`${API_BASE}/donor/eligibility`, {
        headers: getHeaders(),
      }).then(handleResponse),

    getHistory: () =>
      fetch(`${API_BASE}/donor/history`, {
        headers: getHeaders(),
      }).then(handleResponse),

    getRequests: () =>
      fetch(`${API_BASE}/donor/requests`, {
        headers: getHeaders(),
      }).then(handleResponse),

    respondToRequest: (matchId, action, reason) =>
      fetch(`${API_BASE}/donor/requests/${matchId}/respond`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ action, reason }),
      }).then(handleResponse),
  },

  // Hospital
  hospital: {
    getProfile: () =>
      fetch(`${API_BASE}/hospital/profile`, {
        headers: getHeaders(),
      }).then(handleResponse),

    updateProfile: (body) =>
      fetch(`${API_BASE}/hospital/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(body),
      }).then(handleResponse),

    searchDonors: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return fetch(`${API_BASE}/hospital/donors?${query}`, {
        headers: getHeaders(),
      }).then(handleResponse);
    },

    submitRequest: (body) =>
      fetch(`${API_BASE}/hospital/requests`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body),
      }).then(handleResponse),

    getMyRequests: () =>
      fetch(`${API_BASE}/hospital/requests`, {
        headers: getHeaders(),
      }).then(handleResponse),

    getRequestDetails: (id) =>
      fetch(`${API_BASE}/hospital/requests/${id}`, {
        headers: getHeaders(),
      }).then(handleResponse),

    cancelRequest: (id) =>
      fetch(`${API_BASE}/hospital/requests/${id}/cancel`, {
        method: 'PUT',
        headers: getHeaders(),
      }).then(handleResponse),

    confirmDonation: (body) =>
      fetch(`${API_BASE}/hospital/confirm-donation`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body),
      }).then(handleResponse),
  },

  // Inventory
  inventory: {
    getInventory: (hospitalId) => {
      const query = hospitalId ? `?hospitalId=${hospitalId}` : '';
      return fetch(`${API_BASE}/inventory${query}`, {
        headers: getHeaders(),
      }).then(handleResponse);
    },

    updateInventory: (bloodGroup, units) =>
      fetch(`${API_BASE}/inventory`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ bloodGroup, units }),
      }).then(handleResponse),
  },

  // Admin
  admin: {
    getStats: () =>
      fetch(`${API_BASE}/admin/stats`, {
        headers: getHeaders(),
      }).then(handleResponse),

    getUsers: (role) => {
      const query = role ? `?role=${role}` : '';
      return fetch(`${API_BASE}/admin/users${query}`, {
        headers: getHeaders(),
      }).then(handleResponse);
    },

    toggleUserStatus: (id) =>
      fetch(`${API_BASE}/admin/users/${id}/toggle-status`, {
        method: 'PUT',
        headers: getHeaders(),
      }).then(handleResponse),

    getRequests: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return fetch(`${API_BASE}/admin/requests?${query}`, {
        headers: getHeaders(),
      }).then(handleResponse);
    },

    getReports: () =>
      fetch(`${API_BASE}/admin/reports`, {
        headers: getHeaders(),
      }).then(handleResponse),
  },

  // Notifications
  notifications: {
    getMyNotifications: () =>
      fetch(`${API_BASE}/notifications`, {
        headers: getHeaders(),
      }).then(handleResponse),

    markAsRead: (id) =>
      fetch(`${API_BASE}/notifications/${id}/read`, {
        method: 'PUT',
        headers: getHeaders(),
      }).then(handleResponse),

    markAllAsRead: () =>
      fetch(`${API_BASE}/notifications/read-all`, {
        method: 'PUT',
        headers: getHeaders(),
      }).then(handleResponse),
  },

  // Config Rules
  getEligibilityRules: () =>
    fetch(`${API_BASE}/eligibility-rules`).then(handleResponse),
};
