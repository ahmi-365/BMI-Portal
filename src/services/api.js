// API service: real HTTP client for backend endpoints
import { auth, userAuth } from "./auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE;

// Extracts a readable backend message from a failed response
const parseErrorResponse = async (response) => {
  const fallback = `Request failed with status ${response.status}`;
  try {
    const text = await response.text();
    if (!text) return fallback;
    try {
      const data = JSON.parse(text);
      return (
        data?.message ||
        data?.error ||
        (Array.isArray(data?.errors) ? data.errors[0] : null) ||
        text
      );
    } catch {
      return text;
    }
  } catch {
    return fallback;
  }
};

const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = auth?.getToken?.();

  const config = {
    method: options.method || "GET",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  };

  // Only set Content-Type if not FormData
  if (!options.isFormData) {
    config.headers["Content-Type"] = "application/json";
  }

  if (options.body) {
    config.body = options.body;
  }

  try {
    const response = await fetch(url, config);

    if (response.status === 401) {
      try {
        auth.clear();
      } catch (e) { }
      if (typeof window !== "undefined") window.location.href = "/signin";
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      // CRITICAL FIX: Parse the full error response and attach it to the error
      const contentType = response.headers.get("content-type") || "";
      let errorData = null;

      try {
        const text = await response.text();
        if (text && contentType.includes("application/json")) {
          errorData = JSON.parse(text);
        } else {
          errorData = {
            message: text || `Request failed with status ${response.status}`,
          };
        }
      } catch (parseError) {
        errorData = {
          message: `Request failed with status ${response.status}`,
        };
      }

      // Create error with message
      const message =
        errorData?.message ||
        errorData?.error ||
        (Array.isArray(errorData?.errors) ? errorData.errors[0] : null) ||
        `Request failed with status ${response.status}`;

      const error = new Error(message);

      // IMPORTANT: Attach the full error data to the error object
      error.responseData = errorData;
      error.status = response.status;

      throw error;
    }

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return await response.json();
    }

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

  // Handle "invoices/index" -> Invoices resource
  if (resourceName === "invoices/index") {
    resource = "invoices";
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
  let total = envelope?.total ?? list?.length ?? 0;
  // If total not provided and list is full page, assume there might be more
  if (total === perPage && page === 1 && !envelope?.total) {
    total = perPage + 1;
  }
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
  { page = 1, perPage = 25, search = "", ...rest } = {}
) => {
  const qs = buildQueryString({
    page,
    per_page: perPage,
    ...(search ? { search } : {}),
    ...rest,
  });
  if (resource === "roles") {
    // Roles index returns { status: 'success', data: { roles: {...}, permissions: {...} } }
    // We want to normalize data.roles
    const res = await apiCall(`/${resource}${qs}`);
    const rolesData = res?.data?.roles || res?.data || res;
    return normalizePagination(rolesData, page, perPage);
  }

  const res = await apiCall(`/${resource}${qs}`);
  return normalizePagination(res, page, perPage);
};

// User Panel list helper (uses userAuth)
export const userListResource = async (
  resource,
  { page = 1, perPage = 25, search = "", ...rest } = {}
) => {
  const qs = buildQueryString({
    page,
    per_page: perPage,
    ...(search ? { search } : {}),
    ...rest,
  });
  const res = await userApiCall(`/${resource}${qs}`);
  return normalizePagination(res, page, perPage);
};

export const apiCallFormData = async (endpoint, formData, method = "POST") => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = auth?.getToken?.();

  const config = {
    method,
    mode: "cors",
    credentials: "include",
    headers: {
      "Accept": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  };

  try {
    const response = await fetch(url, config);
    if (response.status === 401) {
      try {
        auth.clear();
      } catch (e) { }
      if (typeof window !== "undefined") window.location.href = "/signin";
      throw new Error("Unauthorized");
    }
    if (!response.ok) {
      const message = await parseErrorResponse(response);
      throw new Error(message);
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

  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  // Only set Content-Type when we are not sending FormData
  if (!options.isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const config = {
    method: options.method || "GET",
    mode: "cors",
    credentials: "include",
    headers,
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
        } catch (e) { }
        if (typeof window !== "undefined") window.location.href = "/user/login";
        throw new Error("Unauthorized");
      }
    }
    if (!response.ok) {
      const message = await parseErrorResponse(response);
      throw new Error(message);
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
    mode: "cors",
    credentials: "include",
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
      } catch (e) { }
      if (typeof window !== "undefined") window.location.href = "/user/login";
      throw new Error("Unauthorized");
    }
    if (!response.ok) {
      const message = await parseErrorResponse(response);
      throw new Error(message);
    }
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) return await response.json();
    return await response.text();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const userDownloadBlob = async (endpoint, data = null) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = userAuth?.getToken?.();

  const config = {
    mode: "cors",
    credentials: "include",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };

  // If data is provided, use POST method with JSON body
  if (data) {
    config.method = "POST";
    config.headers["Content-Type"] = "application/json";
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, config);
    if (response.status === 401) {
      try {
        userAuth.clear();
      } catch (e) { }
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
  // Some endpoints (notably invoices) also expose /<resource>/:id
  // Try the most likely endpoint first, then fall back if it fails.
  if (resource === "invoices" || resource === "ppis") {
    try {
      const res = await apiCall(`/${resource}/${id}`);
      return res?.data ?? res;
    } catch (err) {
      // fallback to /invoices/show/:id
      const res = await apiCall(`/${resource}/show/${id}`);
      return res?.data ?? res;
    }
  }

  if (resource === "roles") {
    const res = await apiCall(`/roles/show/${id}`);
    const data = res?.data || res;
    // Transform API response to flat format for ResourceForm
    // API returns { role: {id, name}, permissions: [{name, selected}, ...] }
    const role = data.role || {};
    const perms = data.permissions || [];
    // If permissions is object (grouped), flatten it
    const flatPerms = Array.isArray(perms)
      ? perms
      : Object.values(perms).flat();

    // Extract selected permissions
    const selected = flatPerms
      .filter(p => p.selected)
      .map(p => p.name);

    return {
      ...role,
      permissions: selected
    };
  }

  try {
    const res = await apiCall(`/${resource}/show/${id}`);
    return res?.data ?? res;
  } catch (err) {
    // fallback to /<resource>/:id
    const res = await apiCall(`/${resource}/${id}`);
    return res?.data ?? res;
  }
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
  // Fetch activity logs (paginated with filters)
  logs: (page = 1, params = {}) => {
    const queryParams = new URLSearchParams({ page, ...params });
    return apiCall(`/admin/logs?${queryParams.toString()}`);
  },

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

  bulkDownload: (ids) => downloadBlobPost("/customers/bulk-download", { ids }),

  deleteDoc: (docId) =>
    apiCall(`/customers/doc/delete/${docId}`, {
      method: "DELETE",
    }),
};

// Companies API (for dropdowns and lookups)
export const companiesAPI = {
  list: () => apiCall("/companies"),
};

// Invoices APIs
export const invoicesAPI = {
  list: (params) => listResource("invoices", params),

  allInvoices: (search = "") => {
    const qs = search ? `?search=${encodeURIComponent(search)}` : "";
    return apiCall(`/all-invoices${qs}`);
  },

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

  bulkDownload: (ids) => downloadBlobPost("/invoices/bulk-download", { ids }),

  bulkParse: (formData) =>
    apiCallFormData("/invoices/bulk-parse", formData, "POST"),

  bulkUpload: (data) =>
    apiCall("/invoices/bulk-upload", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  exportCSV: (ids) =>
    downloadBlobPost("/invoices/export", {
      ids,
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

  // ZIP download
  bulkDownload: (ids) => downloadBlobPost("/debitnotes/bulk-download", { ids }),

  // CSV download
  exportCSV: (ids) => downloadBlobPost("/debitnotes/export", { ids }),

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
  bulkUpload: (data) =>
    apiCall("/creditnotes/bulk-upload", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  bulkParse: (formData) =>
    apiCallFormData("/creditnotes/bulk-parse", formData, "POST"),
  list: (params) => listResource("creditnotes", params),

  show: (id) => apiCall(`/creditnotes/${id}`),

  create: (formData) =>
    apiCallFormData("/creditnotes/create", formData, "POST"),

  update: (id, formData) =>
    apiCallFormData(`/creditnotes/update/${id}`, formData, "POST"),

  delete: (id) => apiCall(`/creditnotes/delete/${id}`, { method: "DELETE" }),

  download: (id) => apiCall(`/creditnotes/download/${id}`),

  bulkDelete: (ids) =>
    apiCall("/creditnotes/delete/bulk", {
      method: "POST",
      body: JSON.stringify({ ids }),
    }),

  bulkDownload: (ids) =>
    downloadBlobPost("/creditnotes/bulk-download", { ids }),

  //   ADD THIS
  exportCSV: (ids) => downloadBlobPost("/creditnotes/export", { ids }),
};

// CN PPI APIs
export const ppisAPI = {
  list: (params) => listResource("ppis", params),
  allCreditnotes: () => {
    return apiCall(`/ppis/all-creditnotes`);
  },
  show: (id) => apiCall(`/ppis/show/${id}`),

  create: (formData) => apiCallFormData("/ppis/create", formData, "POST"),

  update: (id, formData) =>
    apiCallFormData(`/ppis/update/${id}`, formData, "POST"),

  delete: (id) =>
    apiCall(`/ppis/delete/${id}`, {
      method: "DELETE",
    }),

  download: (id) => apiCall(`/ppis/download/${id}`),

  bulkDownload: (ids) => downloadBlobPost("/ppis/bulk-download", { ids }),

  bulkDelete: (ids) =>
    apiCall("/ppis/delete/bulk", {
      method: "POST",
      body: JSON.stringify({ ids }),
    }),

  bulkParse: (formData) =>
    apiCallFormData("/ppis/bulk-parse", formData, "POST"),

  bulkUpload: (data) =>
    apiCall("/ppis/bulk-upload", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  bulkDownload: (ids) => downloadBlobPost("/ppis/bulk-download", { ids }),
  exportCSV: (ids) => downloadBlobPost("/ppis/export", { ids }),
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

  bulkDownload: (ids) => downloadBlobPost("/statements/bulk-download", { ids }),

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
  exportCSV: (ids) => downloadBlobPost("/statements/export", { ids }),
};

// Reports / exports
export const reportsAPI = {
  export: async ({
    resource,
    user_ids = [],
    date_from = null,
    date_to = null,
  }) => {
    const url = `${API_BASE_URL}/reports/export`;
    const token = auth?.getToken?.();

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/octet-stream",
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ resource, user_ids, date_from, date_to }),
    });

    if (response.status === 401) {
      try {
        auth.clear();
      } catch (e) { }
      if (typeof window !== "undefined") window.location.href = "/signin";
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      const message = await parseErrorResponse(response);
      throw new Error(message);
    }

    return await response.blob();
  },

  bulkDownload: async ({
    model,
    user_ids = [],
    type = "zip",
    date_from = null,
    date_to = null,
  }) => {
    const url = `${API_BASE_URL}/files-download-bulk`;
    const token = auth?.getToken?.();

    const payload = {
      model,
      type,
    };

    if (user_ids && user_ids.length > 0) {
      payload.user_ids = user_ids;
    }

    if (date_from) {
      payload.date_from = date_from;
    }

    if (date_to) {
      payload.date_to = date_to;
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/octet-stream",
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 401) {
      try {
        auth.clear();
      } catch (e) { }
      if (typeof window !== "undefined") window.location.href = "/signin";
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      const message = await parseErrorResponse(response);
      throw new Error(message);
    }

    return await response.blob();
  },
  UserbulkDownload: async ({
    model,
    date_from = null,
    date_to = null,
  }) => {
    const url = `${API_BASE_URL}/user/files-download-bulk`;
    const token = userAuth?.getToken?.();

    const payload = {
      model,
    };

    if (date_from) {
      payload.date_from = date_from;
    }

    if (date_to) {
      payload.date_to = date_to;
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/octet-stream",
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 401) {
      try {
        userAuth.clear();
      } catch (e) { }
      if (typeof window !== "undefined") window.location.href = "/user/login";
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      const message = await parseErrorResponse(response);
      throw new Error(message);
    }

    return await response.blob();
  },
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
      } catch (e) { }
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

// Download blob with POST request (for bulk downloads)
export const downloadBlobPost = async (endpoint, data) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = auth?.getToken?.();

  const config = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  };

  try {
    const response = await fetch(url, config);
    if (response.status === 401) {
      try {
        auth.clear();
      } catch (e) { }
      if (typeof window !== "undefined") window.location.href = "/signin";
      throw new Error("Unauthorized");
    }
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`API Error: ${response.status} ${text}`);
    }
    return await response.blob();
  } catch (error) {
    console.error("API Error (blob post):", error);
    throw error;
  }
};

// Delivery Orders APIs
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

  bulkDownload: (ids) =>
    downloadBlobPost("/deliveryorders/bulk-download", { ids }),

  // 🔥 ADD THIS (CSV EXPORT)
  exportCSV: (ids) => downloadBlobPost("/deliveryorders/export", { ids }),
  // Support bulk-parse (if needed) and bulk-upload for batch delivery order uploads
  bulkParse: (formData) => apiCallFormData("/deliveryorders/bulk-parse", formData, "POST"),
  bulkUpload: (formData) => apiCallFormData("/deliveryorders/bulk-upload", formData, "POST"),
};

// Payments APIs
export const paymentsAPI = {
  list: (params) => listResource("payments", params),

  pending: () => apiCall("/payments/pending"),

  approved: () => apiCall("/payments/approved"),

  approve: (id) => apiCall(`/payments/approve/${id}`, { method: "POST" }),

  delete: (id) => apiCall(`/payments/delete/${id}`, { method: "DELETE" }),

  download: (id) => apiCall(`/statements/download/${id}`),

  bulkDownload: (ids) =>
    downloadBlobPost("/payments/bulk-download", { ids }),


  exportApprovedCSV: (ids) =>
    downloadBlobPost("/payments/export/approved", { ids }),

  exportPendingCSV: (ids) =>
    downloadBlobPost("/payments/export/pending", { ids }),


  uploadProof: (formData) =>
    apiCallFormData("/payments/upload-proof", formData, "POST"),
  delete: (id) =>
    apiCall(`/payments/delete/${id}`, {
      method: "DELETE",
    }),
  bulkDelete: async (ids) => {
    const results = await Promise.allSettled(
      ids.map((id) => paymentsAPI.delete(id))
    );
    const failures = results.filter((result) => result.status === "rejected");
    if (failures.length > 0) {
      throw new Error(`Failed to delete ${failures.length} payment(s)`);
    }
    return results.map((result) => result.value);
  },
};

// Admin Notifications APIs
export const adminNotificationsAPI = {
  list: () => apiCall("/admin/notifications"),
  markAsRead: (id) =>
    apiCall(`/admin/notifications/read/${id}`, {
      method: "POST",
    }),
  markAllAsRead: (ids = []) =>
    apiCall("/admin/notifications/read-all", {
      method: "POST",
      body: JSON.stringify({ ids }),
    }),
};

// Admin Profile APIs
export const adminProfileAPI = {
  profile: () =>
    apiCall("/profile", {
      method: "GET",
    }),
  update: (data) =>
    apiCall("/admin/profile/update", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ============================================================================
// USER PANEL APIs
// ============================================================================

// User Auth APIs
export const userAuthAPI = {
  login: (identity, password) =>
    userApiCall("/user/login", {
      method: "POST",
      body: JSON.stringify({ identity: identity, password }),
    }),

  logout: () =>
    userApiCall("/logout", {
      method: "POST",
    }),

  profile: () =>
    userApiCall("/user/profile", {
      method: "GET",
    }),
  updateProfile: (formData) =>
    userApiCallFormData("/user/profile/update", formData, "POST"),
  changePassword: (data) =>
    userApiCall("/user/change-password", {
      method: "POST",
      body: JSON.stringify(data),
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

// User Notifications APIs
export const userNotificationsAPI = {
  list: () => userApiCall("/user/notifications"),

  markAsRead: (id) =>
    userApiCall(`/user/notifications/read/${id}`, {
      method: "POST",
    }),

  markAllAsRead: () =>
    userApiCall("/user/notifications/read-all", {
      method: "POST",
    }),
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

// User PPIs APIs
export const userPpisAPI = {
  list: (params) => userListResource("user/ppi", params),

  show: (id) => userApiCall(`/user/ppis/show/${id}`),

  download: (id) => userDownloadBlob(`/user/ppi/download/${id}`),

  bulkDownload: (ids) =>
    userApiCall("/user/ppi/bulk-download", {
      method: "POST",
      body: JSON.stringify({ ids }),
    }),
};

// Roles APIs
// Roles APIs - matching provided PHP Controller
export const rolesAPI = {
  list: (params) => listResource("roles", params),

  // Route::post('roles/create', ...)
  create: (data) =>
    apiCall("/roles/create", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Route::post('roles/update/{id}', ...)
  update: (id, data) =>
    apiCall(`/roles/update/${id}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Route::delete('roles/delete/{id}', ...)
  delete: (id) =>
    apiCall(`/roles/delete/${id}`, {
      method: "DELETE",
    }),

  // Route::get('roles/show/{id}', ...)
  show: (id) => apiCall(`/roles/show/${id}`),

  // Route::post('roles/add-permissions/{roleId}', ...)
  addPermissions: (roleId, permissions) =>
    apiCall(`/roles/add-permissions/${roleId}`, {
      method: "POST",
      body: JSON.stringify({ permissions })
    }),

  // Route::post('roles/remove-permissions/{roleId}', ...)
  removePermissions: (roleId, permissions) =>
    apiCall(`/roles/remove-permissions/${roleId}`, {
      method: "POST",
      body: JSON.stringify({ permissions })
    }),
};

// Permissions APIs
export const permissionsAPI = {
  // Route::get('permissions', ...)
  list: () => apiCall("/permissions"),
};
