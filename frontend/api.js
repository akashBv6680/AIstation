/**
 * AI Station — Frontend API Client
 * All fetch calls to the backend go through this module.
 * Import or include this before kiosk.js / admin.js.
 */

// In production: set window.AI_STATION_API_URL before this script loads,
// OR deploy backend and update this fallback URL.
// If frontend and backend are on the same domain (via Netlify redirect), use '/api'.
const API_BASE = window.AI_STATION_API_URL || "https://aistation-production.up.railway.app/api";


// ─── Helpers ────────────────────────────────────────────────────────────────

function getToken() {
  return localStorage.getItem('as_token') || '';
}

function setToken(token) {
  localStorage.setItem('as_token', token);
}

function clearToken() {
  localStorage.removeItem('as_token');
}

async function request(method, path, body = null, auth = false) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE}${path}`, opts);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.message || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export const Auth = {
  async loginAdmin(email, password) {
    const data = await request('POST', '/auth/login', { email, password });
    if (data.token) setToken(data.token);
    return data;
  },
  logout() {
    clearToken();
    window.location.href = '/admin.html';
  },
  isLoggedIn() {
    return !!getToken();
  },
};

// ─── Contact ─────────────────────────────────────────────────────────────────

export const Contact = {
  async submit({ name, email, phone, message, interest }) {
    return request('POST', '/contact', { name, email, phone, message, interest });
  },
};

// ─── Payments / Credits ──────────────────────────────────────────────────────

export const Payments = {
  /**
   * Create a Razorpay order for a credit pack.
   * @param {string} planId  - 'starter' | 'explorer' | 'pro'
   * @param {string} phone   - customer mobile (used as wallet key)
   */
  async createOrder(planId, phone) {
    return request('POST', '/payments/create-order', { planId, phone });
  },

  /**
   * Verify payment after Razorpay callback.
   */
  async verifyPayment({ orderId, paymentId, signature, phone }) {
    return request('POST', '/payments/verify', { orderId, paymentId, signature, phone });
  },

  /**
   * Check wallet balance for a phone number.
   */
  async getBalance(phone) {
    return request('GET', `/payments/balance/${phone}`);
  },
};

// ─── Sessions ────────────────────────────────────────────────────────────────

export const Sessions = {
  /**
   * Start a timed workstation session.
   * @param {string} phone        - customer phone
   * @param {string} workstationId
   */
  async start(phone, workstationId) {
    return request('POST', '/sessions/start', { phone, workstationId }, true);
  },

  /** Pause the active session (freezes timer & credit burn). */
  async pause(sessionId) {
    return request('POST', `/sessions/${sessionId}/pause`, null, true);
  },

  /** Resume a paused session. */
  async resume(sessionId) {
    return request('POST', `/sessions/${sessionId}/resume`, null, true);
  },

  /** End the session and return summary. */
  async end(sessionId) {
    return request('POST', `/sessions/${sessionId}/end`, null, true);
  },

  /** Poll current session state (remaining credits, elapsed time). */
  async status(sessionId) {
    return request('GET', `/sessions/${sessionId}/status`);
  },

  /** Admin: list all sessions (optionally filter by workstationId or date). */
  async list(query = {}) {
    const qs = new URLSearchParams(query).toString();
    return request('GET', `/sessions?${qs}`, null, true);
  },
};

// ─── Admin ───────────────────────────────────────────────────────────────────

export const Admin = {
  async getDashboard() {
    return request('GET', '/admin/dashboard', null, true);
  },
  async getWorkstations() {
    return request('GET', '/admin/workstations', null, true);
  },
  async getTransactions(query = {}) {
    const qs = new URLSearchParams(query).toString();
    return request('GET', `/admin/transactions?${qs}`, null, true);
  },
  async getContacts() {
    return request('GET', '/admin/contacts', null, true);
  },
};

// ─── PWA / SW Registration ───────────────────────────────────────────────────

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('SW registration failed:', err);
    });
  });
}

// Attach to window for non-module HTML pages
window.AIS = { Auth, Contact, Payments, Sessions, Admin };
