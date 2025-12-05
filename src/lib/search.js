export const pages = [
  { path: "/", name: "Home" },
  { path: "/profile", name: "User Profiles" },
  { path: "/admin-users/view", name: "Admin Users" },
  { path: "/admin-users/add", name: "Add Admin User" },
  { path: "/admin-users/batch-upload", name: "Batch Upload Admin Users" },
  { path: "/payment-records/view", name: "View Payment Records" },
  { path: "/payment-records/add", name: "Add Payment Record" },
  {
    path: "/payment-records/batch-upload",
    name: "Batch Upload Payment Records",
  },
  { path: "/invoices/view", name: "View Invoices" },
  { path: "/invoices/add", name: "Add Invoice" },
  { path: "/invoices/batch-upload", name: "Batch Upload Invoices" },
  { path: "/delivery-orders/view", name: "View Delivery Orders" },
  { path: "/delivery-orders/add", name: "Add Delivery Order" },
  {
    path: "/delivery-orders/batch-upload",
    name: "Batch Upload Delivery Orders",
  },
  { path: "/debit-notes/view", name: "View Debit Notes" },
  { path: "/debit-notes/add", name: "Add Debit Note" },
  { path: "/debit-notes/batch-upload", name: "Batch Upload Debit Notes" },
  { path: "/credit-notes/view", name: "View Credit Notes" },
  { path: "/credit-notes/add", name: "Add Credit Note" },
  { path: "/credit-notes/batch-upload", name: "Batch Upload Credit Notes" },
  { path: "/account-statements/view", name: "View Account Statements" },
  { path: "/account-statements/add", name: "Add Account Statement" },
  {
    path: "/account-statements/batch-upload",
    name: "Batch Upload Account Statements",
  },
  { path: "/customers/view", name: "View Customers" },
  { path: "/customers/add", name: "Add Customer" },
  { path: "/customers/batch-upload", name: "Batch Upload Customers" },
  { path: "/administration/view", name: "View Administration" },
  { path: "/administration/add", name: "Add Administration" },
];

export const searchPages = (query) => {
  if (!query) {
    return [];
  }
  return pages.filter((page) =>
    page.name.toLowerCase().includes(query.toLowerCase())
  );
};
