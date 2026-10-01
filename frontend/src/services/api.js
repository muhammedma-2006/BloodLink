const API_BASE = '/api';

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
    const errorMsg = data.message || `Request failed with status ${res.status}`;
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
