// Simple auth helper using localStorage and API endpoints
const TOKEN_KEY = "bmi_admin_token";
const ROLES_KEY = "bmi_admin_roles";
const PERMISSIONS_KEY = "bmi_admin_permissions";
const USER_TOKEN_KEY = "bmi_user_token";
const API_BASE_URL = import.meta.env.VITE_API_BASE;

export const auth = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  },
  getRoles() {
    try {
      return JSON.parse(localStorage.getItem(ROLES_KEY)) || [];
    } catch (e) {
      return [];
    }
  },
  setRoles(roles) {
    localStorage.setItem(ROLES_KEY, JSON.stringify(roles || []));
  },
  getPermissions() {
    try {
      return JSON.parse(localStorage.getItem(PERMISSIONS_KEY)) || [];
    } catch (e) {
      return [];
    }
  },
  setPermissions(permissions) {
    localStorage.setItem(
      PERMISSIONS_KEY,
      JSON.stringify(permissions || [])
    );
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLES_KEY);
    localStorage.removeItem(PERMISSIONS_KEY);
  },
  async login(email, password) {
    const url = `${API_BASE_URL}/login`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Login failed: ${res.status}`);
    }
    const json = await res.json();
    const token = json?.token || json?.data?.token;
    const roles = json?.roles || json?.data?.roles || [];
    const permissions = json?.permissions || json?.data?.permissions || [];
    if (token) this.setToken(token);
    this.setRoles(roles);
    this.setPermissions(permissions);
    return json;
  },
  async logout() {
    const token = this.getToken();
    try {
      await fetch(`${API_BASE_URL}/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    } catch (e) {
      // ignore
    }
    this.clear();
  },
};

// User-specific auth helper
export const userAuth = {
  getToken() {
    return localStorage.getItem(USER_TOKEN_KEY);
  },
  setToken(token) {
    localStorage.setItem(USER_TOKEN_KEY, token);
  },
  clear() {
    localStorage.removeItem(USER_TOKEN_KEY);
  },
};
