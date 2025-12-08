import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import Loader from "../../components/common/Loader";
import { adminUsersAPI } from "../../services/api";

const AdminShow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAdmin = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await adminUsersAPI.show(id);
        // Handle both wrapped and unwrapped responses
        const adminData = response.data || response;
        setAdmin(adminData);
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
          onClick={() => navigate("/admin-users")}
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
        <button
          onClick={() => navigate(`/admins/edit/${id}`)}
          className="inline-flex items-center justify-center rounded-md bg-brand-500 px-4 py-2 text-center font-medium text-white hover:bg-opacity-90 lg:px-6 xl:px-8"
        >
          Edit Admin
        </button>
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

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Phone Number
            </label>
            <p className="text-black dark:text-white">{admin.phone || "—"}</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Role
            </label>
            <p className="text-black dark:text-white">{admin.role || "—"}</p>
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
              {admin.mailable ? "Yes" : "No"}
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Created At
            </label>
            <p className="text-black dark:text-white">
              {admin.created_at
                ? new Date(admin.created_at).toLocaleString()
                : "—"}
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Last Updated
            </label>
            <p className="text-black dark:text-white">
              {admin.updated_at
                ? new Date(admin.updated_at).toLocaleString()
                : "—"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <button
          onClick={() => navigate("/admin-users")}
          className="flex justify-center rounded-lg border border-stroke px-6 py-2.5 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
        >
          Cancel
        </button>
        <button
          onClick={() => navigate(`/admins/edit/${id}`)}
          className="flex justify-center rounded-lg bg-brand-500 px-6 py-2.5 font-medium text-white hover:bg-opacity-90"
        >
          Edit Admin
        </button>
      </div>
    </div>
  );
};

export default AdminShow;
