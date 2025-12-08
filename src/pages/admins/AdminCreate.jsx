import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Form from "../../components/common/Form";
import Toast from "../../components/common/Toast";
import Loader from "../../components/common/Loader";
import { adminUsersAPI } from "../../services/api";

const AdminCreate = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [isLoading, setIsLoading] = useState(isEditing ? true : false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [admin, setAdmin] = useState(null);

  // Load admin data if editing
  useEffect(() => {
    if (isEditing) {
      const loadAdmin = async () => {
        try {
          setIsLoading(true);
          setError(null);
          const response = await adminUsersAPI.show(id);
          const adminData = response.data || response;
          setAdmin(adminData);
        } catch (err) {
          console.error("Error loading admin:", err);
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };
      loadAdmin();
    }
  }, [id, isEditing]);

  // Navigate on success
  useEffect(() => {
    if (success) {
      setShowToast(true);
      const timer = setTimeout(() => {
        console.log("Navigating to /admin-users");
        if (isEditing) {
          navigate(`/admins/show/${id}`, { replace: true });
        } else {
          navigate("/admin-users", { replace: true });
        }
      }, 1500);
    }
  }, [success, navigate, id, isEditing]);

  const handleSubmit = async (data) => {
    console.log("Submitting data:", data);
    setIsSaving(true);
    setError(null);
    try {
      let response;
      if (isEditing) {
        await adminUsersAPI.update(id, data);
        console.log("Admin updated successfully");
        response = { data: { name: data.name, email: data.email } };
      } else {
        response = await adminUsersAPI.create(data);
      }
      console.log("Response:", response);
      const createdAdmin = response.data || response;
      console.log("Admin data:", createdAdmin);
      setSuccess({
        name: createdAdmin.name,
        email: createdAdmin.email,
        id: createdAdmin.id,
      });
    } catch (err) {
      console.error("Error:", err);
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
    ...(isEditing
      ? []
      : [
          {
            name: "password",
            label: "Password",
            type: "password",
            placeholder: "Enter password",
            required: true,
          },
        ]),
    {
      name: "is_mailable",
      label: "Mailable Status",
      type: "toggle",
      placeholder: "Receive email notifications and updates",
      defaultValue: !isEditing,
    },
  ];

  if (isEditing && isLoading) {
    return <Loader />;
  }

  if (isEditing && error && !admin) {
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-bold text-black dark:text-white">
          {isEditing ? "Edit Admin" : "Add New Admin"}
        </h2>
      </div>

      {showToast && success && (
        <Toast
          message={`✨ Admin "${success.name}" ${
            isEditing ? "updated" : "created"
          } successfully! Redirecting...`}
          type="success"
          duration={1500}
          onClose={() => setShowToast(false)}
        />
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-300">
            Error: {error}
          </p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-sm text-red-700 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {!success && (
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
              submitLabel={isEditing ? "Update Admin" : "Create Admin"}
              isLoading={isSaving}
              initialValues={admin || {}}
              onCancel={() =>
                navigate(isEditing ? "/admin-users" : "/admin-users")
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCreate;
