import { auth } from "../services/auth";

export const canAccess = (permission) => {
  if (!permission) return true;
  const permissions = auth.getPermissions();
  return Array.isArray(permissions) && permissions.includes(permission);
};
