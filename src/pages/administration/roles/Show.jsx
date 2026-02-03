import { ChevronLeft, Edit } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Loader from "../../../components/common/Loader";
import PermissionGuard from "../../../components/common/PermissionGuard";
import { formatDateTime } from "../../../lib/dateUtils";
import { rolesAPI } from "../../../services/api";

const RolesShow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  const [role, setRole] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRole = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await rolesAPI.show(id);
        // Handle the API response structure: { data: { role: {...}, permissions: {...} } }
        const data = response.data || response;
        setRole(data.role || data);
        setPermissions(data.permissions || {});
      } catch (err) {
        console.error("Error loading role:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadRole();
    }
  }, [id]);

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-300">
            Error: {error}
          </p>
          <button
            onClick={() => navigate("/administration/roles")}
            className="mt-3 inline-flex items-center justify-center rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
          <p className="text-gray-500 dark:text-gray-400">Role not found.</p>
          <button
            onClick={() => navigate("/administration/roles")}
            className="mt-4 inline-flex items-center justify-center rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => {
            if (returnTo) {
              navigate(decodeURIComponent(returnTo));
            } else {
              navigate("/administration/roles");
            }
          }}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-bold text-black dark:text-white">
          Role Details
        </h2>
        {role?.name?.toLowerCase() !== "super-admin" && (
          <PermissionGuard permission="edit-roles">
            <button
              onClick={() => navigate(`/administration/roles/edit/${id}`)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit Role
            </button>
          </PermissionGuard>
        )}
      </div>

      {/* Role Info Card */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="space-y-6">
          {/* Role Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Role Name
            </label>
            <p className="text-gray-900 dark:text-white font-semibold">
              {role.name}
            </p>
          </div>

          {/* Guard Name */}
          {role.guard_name && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Guard Name
              </label>
              <p className="text-gray-900 dark:text-white">{role.guard_name}</p>
            </div>
          )}

          {/* Permissions */}
          {permissions && Object.keys(permissions).length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Permissions by Category
              </label>
              <div className="space-y-4">
                {Object.entries(permissions).map(([category, permList]) => {
                  const selectedPerms = permList.filter((p) => p.selected);
                  if (selectedPerms.length === 0) return null;

                  return (
                    <div key={category}>
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 capitalize mb-2">
                        {category} ({selectedPerms.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedPerms.map((permission) => (
                          <span
                            key={permission.id}
                            className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          >
                            {permission.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Created At */}
          {role.created_at && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Created At
              </label>
              <p className="text-gray-900 dark:text-white">
                {formatDateTime(role.created_at)}
              </p>
            </div>
          )}

          {/* Updated At */}
          {role.updated_at && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Last Updated
              </label>
              <p className="text-gray-900 dark:text-white">
                {formatDateTime(role.updated_at)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RolesShow;
