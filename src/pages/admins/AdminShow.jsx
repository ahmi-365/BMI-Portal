import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Loader from "../../components/common/Loader";
import { adminUsersAPI } from "../../services/api";
// CHANGE: Import formatDateTime for standardized date+time display
import { formatDateTime } from "../../lib/dateUtils";
import { auth } from "../../services/auth";

const AdminShow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canEdit, setCanEdit] = useState(true);

  useEffect(() => {
    const loadAdmin = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await adminUsersAPI.show(id);
        // The API returns { status: true, data: { admin: {...}, roles: [...], permissions: [...] } }
        const responseData = response.data || response;
        const adminData = responseData.admin || responseData;
        console.log("Admin data:", adminData);
        setAdmin(adminData);

        // Check if current user can edit this admin
        const currentUserRoles = auth.getRoles();
        const currentUserRoleNames = currentUserRoles.map((r) => r.toLowerCase());
        const isSuperAdmin = currentUserRoleNames.includes("super-admin");
        const currentUserId = auth.getUserId();

        // Check if the admin being viewed has super-admin role
        const adminRoles = adminData.roles || [];
        const hasSuperAdminRole = adminRoles.some(
          (role) => role.name?.toLowerCase() === "super-admin"
        );

        // Super-admin users can only be edited by other super-admins (not themselves)
        if (hasSuperAdminRole) {
          if (!isSuperAdmin) {
            // Regular admin cannot edit super-admin
            setCanEdit(false);
          } else if (String(adminData.id) === String(currentUserId)) {
            // Super-admin cannot edit themselves
            setCanEdit(false);
          }
        }
      } catch (err) {
        console.error("Error loading admin:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadAdmin();
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
            onClick={() => navigate("/admin-users")}
            className="mt-3 inline-flex items-center justify-center rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
          <p className="text-gray-500 dark:text-gray-400">Admin not found.</p>
          <button
            onClick={() => navigate("/admin-users")}
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
              navigate("/admin-users");
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
          Admin Details
        </h2>
        {canEdit && (
          <button
            onClick={() => {
              const editUrl = returnTo
                ? `/admins/edit/${id}?returnTo=${encodeURIComponent(returnTo)}`
                : `/admins/edit/${id}`;
              navigate(editUrl);
            }}
            className="inline-flex items-center justify-center rounded-md bg-brand-500 px-4 py-2 text-center font-medium text-white hover:bg-opacity-90 lg:px-6 xl:px-8"
          >
            Edit Admin
          </button>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
        {/* Personal Information */}
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <h3 className="font-medium text-black dark:text-white">
            Personal Information
          </h3>
        </div>

        <div className="p-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Full Name
            </label>
            <p className="text-black dark:text-white">{admin.name || "—"}</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email Address
            </label>
            <p className="text-black dark:text-white">{admin.email || "—"}</p>
          </div>
        </div>

        {/* Bio Section */}
        {admin.bio && (
          <>
            <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-800">
              <h3 className="font-medium text-black dark:text-white">
                Biography
              </h3>
            </div>

            <div className="p-6">
              <p className="text-black dark:text-white whitespace-pre-wrap">
                {admin.bio}
              </p>
            </div>
          </>
        )}

        {/* Additional Information */}
        <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-800">
          <h3 className="font-medium text-black dark:text-white">
            Additional Information
          </h3>
        </div>

        <div className="p-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Mailable Status
            </label>
            <p className="text-black dark:text-white">
              {admin.is_mailable ? "Yes" : "No"}
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Created At
            </label>
            <p className="text-black dark:text-white">
              {/* CHANGE: Use formatDateTime (shows date & time) */}
              {admin.created_at ? formatDateTime(admin.created_at) : "—"}
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Last Updated
            </label>
            <p className="text-black dark:text-white">
              {/* CHANGE: Use formatDateTime (shows date & time) */}
              {admin.updated_at ? formatDateTime(admin.updated_at) : "—"}
            </p>
          </div>
        </div>

        {/* Roles Section */}
        {admin.roles && admin.roles.length > 0 && (
          <>
            <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-800">
              <h3 className="font-medium text-black dark:text-white">
                Assigned Roles
              </h3>
            </div>

            <div className="p-6">
              <div className="flex flex-wrap gap-2">
                {admin.roles.map((role) => (
                  <span
                    key={role.id}
                    className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    {role.name}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <button
          onClick={() => {
            if (returnTo) {
              navigate(decodeURIComponent(returnTo));
            } else {
              navigate("/admin-users");
            }
          }}
          className="flex justify-center rounded-lg border border-stroke px-6 py-2.5 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
        >
          Cancel
        </button>
        {canEdit && (
          <button
            onClick={() => {
              const editUrl = returnTo
                ? `/admins/edit/${id}?returnTo=${encodeURIComponent(returnTo)}`
                : `/admins/edit/${id}`;
              navigate(editUrl);
            }}
            className="flex justify-center rounded-lg bg-brand-500 px-6 py-2.5 font-medium text-white hover:bg-opacity-90"
          >
            Edit Admin
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminShow;
