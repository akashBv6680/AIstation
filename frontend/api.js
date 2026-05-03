(function () {
  const BASE_URL =
    (window.AI_STATION_API_URL || "https://aistation-production.up.railway.app/api").replace(/\/+$/, "");

  let authToken = "";

  function setToken(token) {
    authToken = token || "";
  }

  function getToken() {
    return authToken;
  }

  function buildHeaders(extra = {}, isJson = true) {
    const headers = { ...extra };

    if (isJson) {
      headers["Content-Type"] = "application/json";
    }

    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    return headers;
  }

  async function request(path, options = {}) {
    const url = `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

    const response = await fetch(url, options);
    const contentType = response.headers.get("content-type") || "";

    let data;
    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const message =
        (data && data.message) ||
        (data && data.error) ||
        (typeof data === "string" && data) ||
        `Request failed with status ${response.status}`;
      throw new Error(message);
    }

    return data;
  }

  const API = {
    baseUrl: BASE_URL,

    setToken,
    getToken,

    async login(email, password) {
      return request("/auth/login", {
        method: "POST",
        headers: buildHeaders(),
        body: JSON.stringify({ email, password }),
      });
    },

    async getAdminDashboard() {
      return request("/admin/dashboard", {
        method: "GET",
        headers: buildHeaders({}, false),
      });
    },

    async getAdminTransactions() {
      return request("/payments/transactions", {
        method: "GET",
        headers: buildHeaders({}, false),
      });
    },

    async getContacts() {
      return request("/contact", {
        method: "GET",
        headers: buildHeaders({}, false),
      });
    },

    async createContact(payload) {
      return request("/contact", {
        method: "POST",
        headers: buildHeaders(),
        body: JSON.stringify(payload),
      });
    },

    async getBalance(phone) {
      return request(`/payments/balance/${encodeURIComponent(phone)}`, {
        method: "GET",
        headers: buildHeaders({}, false),
      });
    },

    async createPayment(payload) {
      return request("/payments/create", {
        method: "POST",
        headers: buildHeaders(),
        body: JSON.stringify(payload),
      });
    },

    async verifyPayment(payload) {
      return request("/payments/verify", {
        method: "POST",
        headers: buildHeaders(),
        body: JSON.stringify(payload),
      });
    },

    async startSession(payload) {
      return request("/sessions/start", {
        method: "POST",
        headers: buildHeaders(),
        body: JSON.stringify(payload),
      });
    },

    async endSession(payload) {
      return request("/sessions/end", {
        method: "POST",
        headers: buildHeaders(),
        body: JSON.stringify(payload),
      });
    },

    async getSessions(phone) {
      const query = phone ? `?phone=${encodeURIComponent(phone)}` : "";
      return request(`/sessions${query}`, {
        method: "GET",
        headers: buildHeaders({}, false),
      });
    },

    async getWorkstations() {
      return request("/sessions/workstations", {
        method: "GET",
        headers: buildHeaders({}, false),
      });
    },
  };

  window.AIStationAPI = API;
})();
