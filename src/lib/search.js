export const pages = [
  // Dashboard & Profile
  { path: "/", name: "Dashboard" },
  { path: "/profile", name: "Admin Profile" },

  // Admin Users
  { path: "/admin-users", name: "Admin Users" },
  { path: "/admin-users/batch-upload", name: "Batch Upload Admin Users" },

  // Payments
  { path: "/payments", name: "View Payment Records" },
  { path: "/payments/add", name: "Add Payment Record" },
  { path: "/payments/batch-upload", name: "Batch Upload Payment Records" },

  // Invoices
  { path: "/invoices", name: "View Invoices" },
  { path: "/invoices/add", name: "Add Invoice" },
  { path: "/invoices/batch-upload", name: "Batch Upload Invoices" },

  // Delivery Orders
  { path: "/deliveryorders", name: "View Delivery Orders" },
  { path: "/deliveryorders/add", name: "Add Delivery Order" },
  {
    path: "/deliveryorders/batch-upload",
    name: "Batch Upload Delivery Orders",
  },

  // Debit Notes
  { path: "/debitnotes", name: "View Debit Notes" },
  { path: "/debitnotes/add", name: "Add Debit Note" },
  { path: "/debitnotes/batch-upload", name: "Batch Upload Debit Notes" },

  // Credit Notes
  { path: "/creditnotes", name: "View Credit Notes" },
  { path: "/creditnotes/add", name: "Add Credit Note" },
  { path: "/creditnotes/batch-upload", name: "Batch Upload Credit Notes" },

  // Account Statements
  { path: "/statements", name: "View Account Statements" },
  { path: "/statements/add", name: "Add Account Statement" },
  {
    path: "/statements/batch-upload",
    name: "Batch Upload Account Statements",
  },

  // Customers
  { path: "/customers", name: "View Customers" },
  { path: "/customers/add", name: "Add Customer" },
  { path: "/customers/batch-upload", name: "Batch Upload Customers" },

  // Administration
  { path: "/administration", name: "Administration" },
];


export const searchPages = (query) => {
  if (!query) {
    return [];
  }
  return pages.filter((page) =>
    page.name.toLowerCase().includes(query.toLowerCase())
  );
};
