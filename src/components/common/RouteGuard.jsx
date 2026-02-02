import { Navigate, Outlet } from "react-router-dom";
import { canAccess } from "../../lib/permissionHelper";
import Forbidden from "./Forbidden";

export default function RouteGuard({ permission, children }) {
    if (!canAccess(permission)) {
        return <Forbidden />;
    }

    return children ? children : <Outlet />;
}
