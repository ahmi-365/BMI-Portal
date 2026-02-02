import { canAccess } from "../../lib/permissionHelper";

/**
 * A wrapper component that only renders its children if the user has the required permission.
 * 
 * @param {Object} props
 * @param {string} props.permission - The permission string to check (e.g., "create-invoices").
 * @param {React.ReactNode} props.children - The content to render if permitted.
 * @param {React.ReactNode} [props.fallback=null] - Optional content to render if not permitted.
 * @returns {React.ReactNode}
 */
export default function PermissionGuard({ permission, children, fallback = null }) {
  if (canAccess(permission)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
