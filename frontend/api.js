const API_BASE = window.AI_STATION_API_URL || "https://aistation-production.up.railway.app/api";

function getToken() {
  return localStorage.getItem("asadmintoken");
}

function setToken(token) {
  localStorage.setItem("asadmintoken", token);
}

function clearToken() {
  localStorage.removeItem("asadmintoken");
}

async function request(method, path, body = null, auth = false) {
  const headers = {
    "Content-Type": "application/json"
  };

  if (auth) {
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const opts = { method, headers };

  if (body) {
    opts.body = JSON.stringify(body);
  }

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

const Auth = {
  async loginAdmin(email, password) {
    const data = await request("POST", "/auth/login", { email, password });
    if (data.token) {
      setToken(data.token);
    }
    return data;
  },

  logout() {
    clearToken();
    window.location.href = "admin.html";
  },

  isLoggedIn() {
    return !!getToken();
  }
};

const Contact = {
  async submit(name, email, phone, message, interest) {
    return request("POST", "/contact", {
      name,
      email,
      phone,
      message,
      interest
    });
  }
};

const Payments = {
  async createOrder(planId, phone) {
    return request("POST", "/payments/create-order", { planId, phone });
  },

  async verifyPayment(orderId, paymentId, signature, phone) {
    return request("POST", "/payments/verify", {
      orderId,
      paymentId,
      signature,
      phone
    });
  },

  async getBalance(phone) {
    return request("GET", `/payments/balance/${phone}`);
  }
};

const Sessions = {
  async start(phone, workstationId) {
    return request("POST", "/sessions/start", { phone, workstationId }, true);
  },

  async pause(sessionId) {
    return request("POST", `/sessions/${sessionId}/pause`, null, true);
  },

  async resume(sessionId) {
    return request("POST", `/sessions/${sessionId}/resume`, null, true);
  },

  async end(sessionId) {
    return request("POST", `/sessions/${sessionId}/end`, null, true);
  },

  async status(sessionId) {
    return request("GET", `/sessions/${sessionId}/status`, null, true);
  },

  async list(query = {}) {
    const qs = new URLSearchParams(query).toString();
    return request("GET", `/sessions?${qs}`, null, true);
  }
};

const Admin = {
  async getDashboard() {
    return request("GET", "/admin/dashboard", null, true);
  },

  async getWorkstations() {
    return request("GET", "/admin/workstations", null, true);
  },

  async getTransactions(query = {}) {
    const qs = new URLSearchParams(query).toString();
    return request("GET", `/admin/transactions?${qs}`, null, true);
  },

  async getContacts() {
    return request("GET", "/admin/contacts", null, true);
  }
};

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.warn("SW registration failed:", err);
    });
  });
}

window.AIS = {
  Auth,
  Contact,
  Payments,
  Sessions,
  Admin
};
