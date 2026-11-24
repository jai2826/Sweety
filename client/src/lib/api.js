// Thin fetch wrapper around the Sweety API.
// Reads the base URL from Vite env, attaches the JWT, and throws an Error
// whose message is the server's user-facing error string.

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const TOKEN_KEY = 'sweety.token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const token = tokenStore.get();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Request failed. Please try again.');
  }
  return data;
}

export const api = {
  register: (payload) =>
    request('/auth/register', { method: 'POST', body: payload, auth: false }),
  login: (payload) =>
    request('/auth/login', { method: 'POST', body: payload, auth: false }),
  me: () => request('/auth/me'),

  listReadings: ({ page = 1, limit = 20 } = {}) =>
    request(`/readings?page=${page}&limit=${limit}`),
  createReading: (payload) =>
    request('/readings', { method: 'POST', body: payload }),
  updateReading: (id, payload) =>
    request(`/readings/${id}`, { method: 'PUT', body: payload }),
  deleteReading: (id) => request(`/readings/${id}`, { method: 'DELETE' }),

  reports: (date) => request(`/reports?date=${date}`),
};
