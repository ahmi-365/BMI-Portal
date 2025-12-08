import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import Form from "../../components/common/Form";
import Loader from "../../components/common/Loader";
import { adminUsersAPI } from "../../services/api";

const AdminEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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

  const handleSubmit = async (data) => {
    setIsSaving(true);
    setError(null);
    try {
      await adminUsersAPI.update(id, data);
      navigate(`/admins/show/${id}`);
    } catch (err) {
      console.error("Error updating admin:", err);
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const formFields = [
    {
      name: "name",
      label: "Full Name",
      type: "text",
      placeholder: "Enter full name",
      required: true,
    },
    {
      name: "email",
      label: "Email Address",
      type: "email",
      placeholder: "Enter email address",
      required: true,
    },
    {
      name: "phone",
      label: "Phone Number",
      type: "tel",
      placeholder: "Enter phone number",
    },
    {
      name: "role",
      label: "Role",
      type: "select",
      options: [
        { value: "Admin", label: "Super Admin" },
        { value: "Editor", label: "Editor" },
        { value: "Viewer", label: "Viewer" },
      ],
      required: true,
    },
    {
      name: "bio",
      label: "Bio / Description",
      type: "textarea",
      placeholder: "Type your message",
      colSpan: 2,
    },
    {
      name: "mailable",
      label: "Mailable Status",
      type: "toggle",
      placeholder: "Receive email notifications and updates",
    },
  ];

  if (isLoading) {
    return <Loader />;
  }

  if (error && !admin) {
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
          Edit Admin
        </h2>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-900">
          <p className="text-red-800 dark:text-red-300">Error: {error}</p>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <h3 className="font-medium text-black dark:text-white">
            Personal Information
          </h3>
        </div>

        <div className="p-6">
          <Form
            fields={formFields}
            onSubmit={handleSubmit}
            submitLabel="Update Admin"
            isLoading={isSaving}
            initialValues={admin}
            onCancel={() => navigate("/admin-users")}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminEdit;
