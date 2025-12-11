// API service: real HTTP client for backend endpoints
import { auth, userAuth } from "./auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE;

// Helper function to make API requests with auth header
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = auth?.getToken?.();

  const config = {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  };

  if (options.body) {
    config.body = options.body;
  }

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
// Generic delete helper for resources (uses /<resource>/delete/:id pattern)
export const deleteResource = async (resource, id) => {
  // Many backend endpoints expect DELETE at /<resource>/delete/:id
  // Accept both resourceName (eg. 'customers-approved') or raw resource ('customers')
  const { resource: parsed } = parseResourceName(resource);
  const res = await apiCall(`/${parsed}/delete/${id}`, {
    method: "DELETE",
  });
  return res?.data ?? res;
};
// Helper to map special resource names (eg. "payment-records-paid")
// Helper to map special resource names (eg. "approve-customer")
const parseResourceName = (resourceName) => {
  const params = {};
  let resource = resourceName;

  // Handle generic suffixes
  if (resourceName.endsWith("-paid")) {
    resource = resourceName.replace(/-paid$/, "");
    params.status = "paid";
  }
  if (resourceName.endsWith("-not-acknowledged")) {
    resource = resourceName.replace(/-not-acknowledged$/, "");
    params.status = "not-acknowledged";
  }

  // --- FIXES START HERE ---

  // Handle "approve-customer" -> Customers resource with status=approved
  if (
    resourceName === "approve-customer" ||
    resourceName === "approve-customers"
  ) {
    resource = "customers";
    params.status = "approved";
  }

  // Handle "pending-customer" -> Customers resource with status=pending
  if (
    resourceName === "pending-customer" ||
    resourceName === "pending-customers"
  ) {
    resource = "customers";
    params.status = "pending";
  }
  // Support alternative endpoint names used by backend
  if (resourceName === "approved-customers") {
    resource = "customers";
    params.status = "approved";
  }
  if (resourceName === "pending-customers") {
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

// Normalize backend pagination shape to a common structure
const normalizePagination = (res, fallbackPage = 1, fallbackPerPage = 25) => {
  const envelope = res?.data && typeof res.data === "object" ? res.data : res;
  const list = envelope?.data ?? res?.data ?? res ?? [];
  const page = envelope?.current_page ?? envelope?.page ?? fallbackPage;
  const perPage = envelope?.per_page ?? envelope?.perPage ?? fallbackPerPage;
  const total = envelope?.total ?? list?.length ?? 0;
  const lastPage =
    envelope?.last_page ??
    envelope?.lastPage ??
    (perPage ? Math.ceil(total / perPage) : 1);

  return {
    rows: Array.isArray(list) ? list : [],
    page,
    perPage,
    total,
    lastPage,
    nextPageUrl: envelope?.next_page_url ?? envelope?.nextPageUrl ?? null,
    prevPageUrl: envelope?.prev_page_url ?? envelope?.prevPageUrl ?? null,
  };
};

// Unified list helper with search + pagination
export const listResource = async (
  resource,
  { page = 1, perPage = 25, search = "" } = {}
) => {
  const qs = buildQueryString({
    page,
    per_page: perPage,
    ...(search ? { search } : {}),
  });
  const res = await apiCall(`/${resource}${qs}`);
  return normalizePagination(res, page, perPage);
};

// User Panel list helper (uses userAuth)
export const userListResource = async (
  resource,
  { page = 1, perPage = 25, search = "" } = {}
) => {
  const qs = buildQueryString({
    page,
    per_page: perPage,
    ...(search ? { search } : {}),
  });
  const res = await userApiCall(`/${resource}${qs}`);
  return normalizePagination(res, page, perPage);
};

// Helper to send FormData (for file uploads)
export const apiCallFormData = async (endpoint, formData, method = "POST") => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = auth?.getToken?.();

  const config = {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  };

  try {
    const response = await fetch(url, config);
    if (response.status === 401) {
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

// User Panel API Helpers (with userAuth token)
export const userApiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = userAuth?.getToken?.();

  const config = {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  };

  // Only add body if it exists
  if (options.body) {
    config.body = options.body;
  }

  try {
    const response = await fetch(url, config);
    if (response.status === 401) {
      // Don't redirect on login endpoint - let it handle the error
      if (endpoint !== "/user/login") {
        try {
          userAuth.clear();
        } catch (e) {}
        if (typeof window !== "undefined") window.location.href = "/user/login";
        throw new Error("Unauthorized");
      }
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

export const userApiCallFormData = async (
  endpoint,
  formData,
  method = "POST"
) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = userAuth?.getToken?.();

  const config = {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  };

  try {
    const response = await fetch(url, config);
    if (response.status === 401) {
      try {
        userAuth.clear();
      } catch (e) {}
      if (typeof window !== "undefined") window.location.href = "/user/login";
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

export const userDownloadBlob = async (endpoint) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = userAuth?.getToken?.();

  const config = {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };

  try {
    const response = await fetch(url, config);
    if (response.status === 401) {
      try {
        userAuth.clear();
      } catch (e) {}
      if (typeof window !== "undefined") window.location.href = "/user/login";
      throw new Error("Unauthorized");
    }
    if (!response.ok) throw new Error(`Download failed: ${response.status}`);
    return await response.blob();
  } catch (error) {
    console.error("Download Error:", error);
    throw error;
  }
};

// Former mock functions now call real API endpoints.
// Generic resource helpers that call the real API endpoints
export const getResourceById = async (resourceName, id) => {
  const { resource } = parseResourceName(resourceName);
  // Many backend endpoints expose a show route at /<resource>/show/:id
  const res = await apiCall(`/${resource}/show/${id}`);
  return res?.data ?? res;
};

export const createResource = async (resourceName, data) => {
  const { resource } = parseResourceName(resourceName);
  const res = await apiCall(`/${resource}/create`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res?.data ?? res;
};

export const updateResource = async (resourceName, id, data) => {
  const { resource } = parseResourceName(resourceName);
  const res = await apiCall(`/${resource}/update/${id}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res?.data ?? res;
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

// ============================================================================
// ADMIN PANEL APIs
// ============================================================================

// Auth APIs
export const authAPI = {
  login: (email, password) =>
    apiCall("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    apiCall("/logout", {
      method: "POST",
    }),

  profile: () =>
    apiCall("/profile", {
      method: "POST",
    }),
};

// Admin Users APIs
export const adminUsersAPI = {
  list: (params) => listResource("admins", params),

  create: (data) =>
    apiCall("/admins/create", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  show: (id) => apiCall(`/admins/show/${id}`),

  update: (id, formData) =>
    apiCallFormData(`/admins/update/${id}`, formData, "POST"),

  delete: (id) =>
    apiCall(`/admins/delete/${id}`, {
      method: "DELETE",
    }),
};

// Admin APIs
export const adminAPI = {
  // Fetch activity logs (paginated). Accepts optional page number.
  logs: (page = 1) => apiCall(`/admin/logs?page=${page}`),

  // Change admin password using backend payload shape
  changePassword: (data) =>
    apiCall("/admin/change-password", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// Customers APIs
export const customersAPI = {
  list: (params) => listResource("customers", params),

  create: (data) => {
    // If caller passed a FormData (file uploads), use FormData helper
    if (typeof FormData !== "undefined" && data instanceof FormData) {
      return apiCallFormData("/customers/create", data, "POST");
    }
    return apiCall("/customers/create", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: (id, data) => {
    if (typeof FormData !== "undefined" && data instanceof FormData) {
      return apiCallFormData(`/customers/update/${id}`, data, "POST");
    }
    return apiCall(`/customers/update/${id}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  show: (id) => apiCall(`/customers/show/${id}`),

  delete: (id) =>
    apiCall(`/customers/delete/${id}`, {
      method: "DELETE",
    }),

  changePassword: (data) =>
    apiCall("/customers/change-password", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  approve: (id) =>
    apiCall(`/customers/${id}/approve`, {
      method: "POST",
    }),
};

// Companies API (for dropdowns and lookups)
export const companiesAPI = {
  list: () => apiCall("/companies"),
};

// Invoices APIs
export const invoicesAPI = {
  list: (params) => listResource("invoices", params),

  show: (id) => apiCall(`/invoices/${id}`),

  create: (formData) => apiCallFormData("/invoices/create", formData, "POST"),

  update: (id, formData) =>
    apiCallFormData(`/invoices/update/${id}`, formData, "POST"),

  delete: (id) =>
    apiCall(`/invoices/delete/${id}`, {
      method: "DELETE",
    }),

  download: (id) => apiCall(`/invoices/download/${id}`),

  bulkDelete: (ids) =>
    apiCall("/invoices/delete/bulk", {
      method: "POST",
      body: JSON.stringify({ ids }),
    }),
};

// Debit Notes APIs
export const debitNotesAPI = {
  list: (params) => listResource("debitnotes", params),

  show: (id) => apiCall(`/debitnotes/${id}`),

  create: (formData) => apiCallFormData("/debitnotes/create", formData, "POST"),

  update: (id, formData) =>
    apiCallFormData(`/debitnotes/update/${id}`, formData, "POST"),

  delete: (id) =>
    apiCall(`/debitnotes/delete/${id}`, {
      method: "DELETE",
    }),

  download: (id) => apiCall(`/debitnotes/download/${id}`),

  bulkDelete: (ids) =>
    apiCall("/debitnotes/delete/bulk", {
      method: "POST",
      body: JSON.stringify({ ids }),
    }),

  bulkParse: (formData) =>
    apiCallFormData("/debitnotes/bulk-parse", formData, "POST"),

  bulkUpload: (data) =>
    apiCall("/debitnotes/bulk-upload", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// Credit Notes APIs
export const creditNotesAPI = {
  list: (params) => listResource("creditnotes", params),

  show: (id) => apiCall(`/creditnotes/${id}`),

  create: (formData) =>
    apiCallFormData("/creditnotes/create", formData, "POST"),

  update: (id, formData) =>
    apiCallFormData(`/creditnotes/update/${id}`, formData, "POST"),

  delete: (id) =>
    apiCall(`/creditnotes/delete/${id}`, {
      method: "DELETE",
    }),

  download: (id) => apiCall(`/creditnotes/download/${id}`),

  bulkDelete: (ids) =>
    apiCall("/creditnotes/delete/bulk", {
      method: "POST",
      body: JSON.stringify({ ids }),
    }),

  bulkParse: (formData) =>
    apiCallFormData("/creditnotes/bulk-parse", formData, "POST"),

  bulkUpload: (data) =>
    apiCall("/creditnotes/bulk-upload", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// Account Statements APIs
export const statementsAPI = {
  list: (params) => listResource("statements", params),

  show: (id) => apiCall(`/statements/show/${id}`),

  create: (formData) => apiCallFormData("/statements/create", formData, "POST"),

  update: (id, formData) =>
    apiCallFormData(`/statements/update/${id}`, formData, "POST"),

  delete: (id) =>
    apiCall(`/statements/delete/${id}`, {
      method: "DELETE",
    }),

  download: (id) => apiCall(`/statements/download/${id}`),

  bulkDelete: (ids) =>
    apiCall("/statements/delete/bulk", {
      method: "POST",
      body: JSON.stringify({ ids }),
    }),

  bulkParse: (formData) =>
    apiCallFormData("/statements/bulk-parse", formData, "POST"),

  bulkUpload: (data) =>
    apiCall("/statements/bulk-upload", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// Helper to download binary content (blob) from an endpoint with auth handling
export const downloadBlob = async (endpoint) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = auth?.getToken?.();

  const config = {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };

  try {
    const response = await fetch(url, config);
    if (response.status === 401) {
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
    return await response.blob();
  } catch (error) {
    console.error("API Error (blob):", error);
    throw error;
  }
};

// Delivery Orders APIs
export const deliveryOrdersAPI = {
  list: (params) => listResource("deliveryorders", params),

  show: (id) => apiCall(`/deliveryorders/${id}`),

  create: (formData) =>
    apiCallFormData("/deliveryorders/create", formData, "POST"),

  update: (id, formData) =>
    apiCallFormData(`/deliveryorders/update/${id}`, formData, "POST"),

  delete: (id) =>
    apiCall(`/deliveryorders/delete/${id}`, {
      method: "DELETE",
    }),

  download: (id) => apiCall(`/deliveryorders/download/${id}`),

  bulkDelete: (ids) =>
    apiCall("/deliveryorders/delete/bulk", {
      method: "POST",
      body: JSON.stringify({ ids }),
    }),

  bulkParse: (formData) =>
    apiCallFormData("/deliveryorders/bulk-parse", formData, "POST"),

  bulkUpload: (data) =>
    apiCall("/deliveryorders/bulk-upload", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// Payments APIs
export const paymentsAPI = {
  list: (params) => listResource("payments", params),

  pending: () => apiCall("/payments/pending"),

  approved: () => apiCall("/payments/approved"),

  approve: (formData) => apiCallFormData("/payments/approve", formData, "POST"),

  download: (id) => apiCall(`/statements/download/${id}`),

  uploadProof: (formData) =>
    apiCallFormData("/payments/upload-proof", formData, "POST"),

  bulkDelete: (ids) =>
    apiCall("/payments/delete/bulk", {
      method: "POST",
      body: JSON.stringify({ ids }),
    }),
};

// ============================================================================
// USER PANEL APIs
// ============================================================================

// User Auth APIs
export const userAuthAPI = {
  login: (email, password) =>
    userApiCall("/user/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    userApiCall("/logout", {
      method: "POST",
    }),

  profile: () =>
    userApiCall("/user/profile", {
      method: "GET",
    }),
};

// User Invoices APIs
export const userInvoicesAPI = {
  list: (params) => userListResource("user/invoices", params),

  show: (id) => userApiCall(`/user/invoices/show/${id}`),

  download: (id) => userDownloadBlob(`/user/invoices/download/${id}`),

  bulkDownload: (ids) =>
    userApiCall("/user/invoices/bulk-download", {
      method: "POST",
      body: JSON.stringify({ ids }),
    }),
};

// User Delivery Orders APIs
export const userDeliveryOrdersAPI = {
  list: (params) => userListResource("user/delivery-orders", params),

  show: (id) => userApiCall(`/user/delivery-orders/show/${id}`),

  download: (id) => userDownloadBlob(`/user/delivery-orders/download/${id}`),

  bulkDownload: (ids) =>
    userApiCall("/user/delivery-orders/bulk-download", {
      method: "POST",
      body: JSON.stringify({ ids }),
    }),
};

// User Debit Notes APIs
export const userDebitNotesAPI = {
  list: (params) => userListResource("user/debit-notes", params),

  show: (id) => userApiCall(`/user/debit-notes/show/${id}`),

  download: (id) => userDownloadBlob(`/user/debit-notes/download/${id}`),

  bulkDownload: (ids) =>
    userApiCall("/user/debit-notes/bulk-download", {
      method: "POST",
      body: JSON.stringify({ ids }),
    }),
};

// User Credit Notes APIs
export const userCreditNotesAPI = {
  list: (params) => userListResource("user/credit-notes", params),

  show: (id) => userApiCall(`/user/credit-notes/show/${id}`),

  download: (id) => userDownloadBlob(`/user/credit-notes/download/${id}`),

  bulkDownload: (ids) =>
    userApiCall("/user/credit-notes/bulk-download", {
      method: "POST",
      body: JSON.stringify({ ids }),
    }),
};

// User Payments APIs
export const userPaymentsAPI = {
  list: (params) => userListResource("user/payments", params),

  show: (id) => userApiCall(`/user/payments/show/${id}`),

  add: (formData) =>
    userApiCallFormData("/user/payments/add", formData, "POST"),

  download: (id) => userDownloadBlob(`/user/payments/download/${id}`),
};

// User Statements APIs
export const userStatementsAPI = {
  list: (params) => userListResource("user/statements", params),

  show: (id) => userApiCall(`/user/statements/show/${id}`),

  download: (id) => userDownloadBlob(`/user/statements/download/${id}`),

  bulkDownload: (ids) =>
    userApiCall("/user/statements/bulk-download", {
      method: "POST",
      body: JSON.stringify({ ids }),
    }),
};
