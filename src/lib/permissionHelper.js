import { auth } from "../services/auth";

export const canAccess = (permission) => {
  if (!permission) return true;
  const permissions = auth.getPermissions();
  return Array.isArray(permissions) && permissions.includes(permission);
};

export const canAccessAny = (permissions = []) => {
  if (!permissions || permissions.length === 0) return true;
  const userPermissions = auth.getPermissions();
  if (!Array.isArray(userPermissions)) return false;
  return permissions.some((permission) => userPermissions.includes(permission));
};

export const getFirstAccessiblePath = (fallback = "/") => {
  const routes = [
    { path: "/", permissions: ["view-dashboard"] },
    { path: "/payments", permissions: ["view-payments", "list-payments"] },
    { path: "/invoices", permissions: ["view-invoices", "list-invoices"] },
    {
      path: "/deliveryorders",
      permissions: ["view-delivery-orders", "list-delivery-orders"],
    },
    { path: "/debitnotes", permissions: ["view-debit-notes", "list-debit-notes"] },
    {
      path: "/creditnotes",
      permissions: ["view-credit-notes", "list-credit-notes"],
    },
    { path: "/ppis", permissions: ["view-ppis", "list-ppis"] },
    { path: "/statements", permissions: ["view-statements", "list-statements"] },
    { path: "/customers", permissions: ["view-customers", "list-customers"] },
    { path: "/admin-users", permissions: ["view-admins", "list-admins"] },
    { path: "/administration", permissions: ["view-roles", "list-roles"] },
  ];

  const match = routes.find((route) => canAccessAny(route.permissions));
  return match ? match.path : fallback;
};
