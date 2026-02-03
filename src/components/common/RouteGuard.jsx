import { Outlet } from "react-router-dom";
import { canAccess, canAccessAny } from "../../lib/permissionHelper";
import Forbidden from "./Forbidden";

export default function RouteGuard({ permission, permissions, children }) {
  // Check multiple permissions if provided
  if (permissions && Array.isArray(permissions)) {
    if (!canAccessAny(permissions)) {
      return <Forbidden />;
    }
  } else if (permission) {
    // Check single permission
    if (!canAccess(permission)) {
      return <Forbidden />;
    }
  }

  return children ? children : <Outlet />;
}
