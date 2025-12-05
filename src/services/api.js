// API service: real HTTP client for backend endpoints
import { auth } from "./auth";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE || "http://localhost:3000/api";

// Helper function to make API requests with auth header
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = auth?.getToken?.();

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    if (response.status === 401) {
      // Protected: clear token and redirect to signin
      try {
        auth.clear();
      } catch (e) {}
      if (typeof window !== "undefined") window.location.href = "/signin";
      throw new Error("Unauthorized");
    }
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`API Error: ${response.status} ${text}`);
    }
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) return await response.json();
    return await response.text();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// Generic CRUD operations
export const apiService = {
  // Get all records for a resource (supports query string)
  getAll: (resource, queryString = "") => apiCall(`/${resource}${queryString}`),

  // Get a single record by ID
  getById: (resource, id) => apiCall(`/${resource}/${id}`),

  // Create a new record
  create: (resource, data) =>
    apiCall(`/${resource}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Update an existing record
  update: (resource, id, data) =>
    apiCall(`/${resource}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Delete a record
  delete: (resource, id) =>
    apiCall(`/${resource}/${id}`, {
      method: "DELETE",
    }),
};

// Helper to map special resource names (eg. "payment-records-paid")
const parseResourceName = (resourceName) => {
  const params = {};
  let resource = resourceName;

  if (resourceName.endsWith("-paid")) {
    resource = resourceName.replace(/-paid$/, "");
    params.status = "paid";
  }
  if (resourceName.endsWith("-not-acknowledged")) {
    resource = resourceName.replace(/-not-acknowledged$/, "");
    params.status = "not-acknowledged";
  }
  if (resourceName === "customers-approved") {
    resource = "customers";
    params.status = "approved";
  }
  if (resourceName === "customers-pending") {
    resource = "customers";
    params.status = "pending";
  }

  return { resource, params };
};

const buildQueryString = (params = {}) => {
  const qs = new URLSearchParams(params);
  const s = qs.toString();
  return s ? `?${s}` : "";
};

// Former mock functions now call real API endpoints.
export const getMockData = async (resourceName) => {
  const { resource, params } = parseResourceName(resourceName);
  const qs = buildQueryString(params);
  const res = await apiService.getAll(resource, qs);
  // If API returns wrapper { data: [...] } handle both shapes
  return res?.data ?? res ?? [];
};

export const getMockDataById = async (resourceName, id) => {
  const { resource } = parseResourceName(resourceName);
  const res = await apiService.getById(resource, id);
  return res?.data ?? res;
};

export const createMockData = async (resourceName, data) => {
  const { resource } = parseResourceName(resourceName);
  const res = await apiService.create(resource, data);
  return res?.data ?? res;
};

export const updateMockData = async (resourceName, id, data) => {
  const { resource } = parseResourceName(resourceName);
  const res = await apiService.update(resource, id, data);
  return res?.data ?? res;
};

export const deleteMockData = async (resourceName, id) => {
  const { resource } = parseResourceName(resourceName);
  const res = await apiService.delete(resource, id);
  return res;
};

export const getPaginatedData = async (
  resourceName,
  page = 1,
  pageSize = 10,
  searchQuery = ""
) => {
  const { resource, params } = parseResourceName(resourceName);
  const merged = { ...params, page, pageSize };
  if (searchQuery) merged.search = searchQuery;
  const qs = buildQueryString(merged);
  const res = await apiService.getAll(resource, qs);
  // Expect backend to return { data, total, page, pageSize, totalPages }
  if (res && res.data) return res;
  // Fallback: build pagination from array
  const arr = Array.isArray(res) ? res : [];
  const total = arr.length;
  const startIndex = (page - 1) * pageSize;
  const paginatedData = arr.slice(startIndex, startIndex + pageSize);
  return {
    data: paginatedData,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
};

export const searchData = async (resourceName, query) => {
  const { resource, params } = parseResourceName(resourceName);
  const merged = { ...params, search: query };
  const qs = buildQueryString(merged);
  const res = await apiService.getAll(resource, qs);
  return res?.data ?? res ?? [];
};
