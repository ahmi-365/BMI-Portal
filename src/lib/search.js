export const pages = [
  // Dashboard & Profile
  { path: "/", name: "Dashboard" },
  { path: "/profile", name: "Admin Profile" },

  // Admin Users
  { path: "/admin-users", name: "Admin Users" },
  { path: "/admin-users/add", name: "Add Admin User" },
  { path: "/admin-users/batch-upload", name: "Batch Upload Admin Users" },

  // Payments
  { path: "/payments", name: "Payment Records" },
  { path: "/payments/view", name: "View Payment Records" },
  { path: "/payments/add", name: "Add Payment Record" },
  { path: "/payments/batch-upload", name: "Batch Upload Payment Records" },

  // Invoices
  { path: "/invoices", name: "Invoices" },
  { path: "/invoices/view", name: "View Invoices" },
  { path: "/invoices/add", name: "Add Invoice" },
  { path: "/invoices/batch-upload", name: "Batch Upload Invoices" },

  // Delivery Orders
  { path: "/deliveryorders", name: "Delivery Orders" },
  { path: "/deliveryorders/view", name: "View Delivery Orders" },
  { path: "/deliveryorders/add", name: "Add Delivery Order" },
  { path: "/deliveryorders/batch-upload", name: "Batch Upload Delivery Orders" },

  // Debit Notes
  { path: "/debitnotes", name: "Debit Notes" },
  { path: "/debitnotes/view", name: "View Debit Notes" },
  { path: "/debitnotes/add", name: "Add Debit Note" },
  { path: "/debitnotes/batch-upload", name: "Batch Upload Debit Notes" },

  // Credit Notes
  { path: "/creditnotes", name: "Credit Notes" },
  { path: "/creditnotes/view", name: "View Credit Notes" },
  { path: "/creditnotes/add", name: "Add Credit Note" },
  { path: "/creditnotes/batch-upload", name: "Batch Upload Credit Notes" },

  // Account Statements
  { path: "/statements", name: "Account Statements" },
  { path: "/statements/view", name: "View Account Statements" },
  { path: "/statements/add", name: "Add Account Statement" },
  { path: "/statements/batch-upload", name: "Batch Upload Account Statements" },

  // Customers
  { path: "/customers", name: "Customers" },
  { path: "/customers/view", name: "View Customers" },
  { path: "/customers/add", name: "Add Customer" },
  { path: "/customers/batch-upload", name: "Batch Upload Customers" },

  // PPIs
  { path: "/ppis", name: "CN PPIs" },
  { path: "/ppis/view", name: "View CN PPIs" },

  // Administration
  { path: "/administration", name: "Administration" },

  // Reports
  { path: "/reports/export", name: "Export Report" },
];


export const searchPages = (query) => {
  if (!query) {
    return [];
  }
  return pages.filter((page) =>
    page.name.toLowerCase().includes(query.toLowerCase())
  );
};
