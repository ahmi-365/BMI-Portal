import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Form from "../../components/common/Form";
import Loader from "../../components/common/Loader";
import Toast from "../../components/common/Toast";
import { adminUsersAPI, rolesAPI } from "../../services/api";
import { auth } from "../../services/auth";

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
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [canEdit, setCanEdit] = useState(true);

  // Load roles on component mount
  useEffect(() => {
    const loadRoles = async () => {
      try {
        setRolesLoading(true);
        const response = await rolesAPI.list();
        console.log("API Response:", response);

        // rolesAPI.list() returns { rows: [...], page, perPage, total, lastPage, ... }
        // We need to extract the rows array
        let rolesList = [];
        if (response.rows && Array.isArray(response.rows)) {
          rolesList = response.rows;
        } else if (Array.isArray(response)) {
          rolesList = response;
        } else if (response.data && Array.isArray(response.data)) {
          rolesList = response.data;
        }

        console.log("Loaded roles:", rolesList);
        setRoles(rolesList);
      } catch (err) {
        console.error("Error loading roles:", err);
      } finally {
        setRolesLoading(false);
      }
    };
    loadRoles();
  }, []);

  // Load admin data if editing
  useEffect(() => {
    if (isEditing) {
      const loadAdmin = async () => {
        try {
          setIsLoading(true);
          setError(null);
          const response = await adminUsersAPI.show(id);
          // Handle both wrapped and unwrapped responses
          const data = response.data || response;
          // Check if admin data is nested (e.g., { data: { admin: {...} } })
          const adminData = data.admin || data;

          // Transform the admin data to match form field names
          const transformedAdmin = {
            ...adminData,
            // Map is_mailable to boolean for the toggle field
            is_mailable: toBooleanIsMailable(adminData.is_mailable),
            // Extract first role name if roles array exists
            role: adminData.roles?.[0]?.name || "",
          };

          setAdmin(transformedAdmin);
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

  // Check if current user can edit this admin
  useEffect(() => {
    if (admin && isEditing) {
      const currentUserRoles = auth.getRoles();
      const currentUserRoleNames = currentUserRoles.map((r) => r.toLowerCase());
      const isSuperAdmin = currentUserRoleNames.includes("super-admin");
      const currentUserId = auth.getUserId();

      // Check if the admin being edited has super-admin role
      const adminRoles = admin.roles || [];
      const hasSuperAdminRole = adminRoles.some(
        (role) => role.name?.toLowerCase() === "super-admin"
      );

      // Super-admin users can only be edited by other super-admins (not themselves)
      if (hasSuperAdminRole) {
        if (!isSuperAdmin) {
          // Regular admin cannot edit super-admin
          setCanEdit(false);
          setError("You do not have permission to edit this admin. Only super-admins can edit super-admin users.");
        } else if (String(admin.id) === String(currentUserId)) {
          // Super-admin cannot edit themselves
          setCanEdit(false);
          setError("You cannot edit your own account. Contact another super-admin to make changes to your account.");
        }
      }
    }
  }, [admin, isEditing]);

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

  // Helpers to normalize is_mailable values between the form and API
  const toBooleanIsMailable = (val) => {
    // Accept strings/numbers/booleans: '1'|'0', 1|0, true|false, 'on'|'off', 'true'|'false'
    if (val === "on") return true;
    if (val === "off") return false;
    if (val === "1" || val === 1) return true;
    if (val === "0" || val === 0) return false;
    if (typeof val === "boolean") return val;
    if (val === "true") return true;
    if (val === "false") return false;
    return false;
  };

  const normalizeIsMailable = (val) => {
    // Backend expects numeric 1 for enabled, 0 for disabled.
    if (val === "on") return 1;
    if (val === "off") return 0;
    if (typeof val === "boolean") return val ? 1 : 0;
    if (val === "1" || val === 1) return 1;
    if (val === "0" || val === 0) return 0;
    if (val === "true") return 1;
    if (val === "false") return 0;
    return 0;
  };

  const handleSubmit = async (data) => {
    // Prevent editing if user doesn't have permission
    if (isEditing && !canEdit) {
      setError("You cannot edit your own account. Please contact another super-admin to make changes.");
      return;
    }

    // Clean payload - only send necessary fields
    const payload = {
      name: data.name,
      email: data.email,
      role: data.role,
      // Ensure API always receives 'on' or 'off'
      is_mailable: normalizeIsMailable(data.is_mailable),
    };

    // Only add password for create mode
    if (!isEditing && data.password) {
      payload.password = data.password;
    }

    console.log("Submitting payload:", payload);
    setIsSaving(true);
    setError(null);
    try {
      let response;
      if (isEditing) {
        // Convert payload to FormData for PUT request
        const formData = new FormData();
        Object.keys(payload).forEach((key) => {
          formData.append(key, payload[key]);
        });
        await adminUsersAPI.update(id, formData);
        console.log("Admin updated successfully");
        response = { data: { name: payload.name, email: payload.email } };
      } else {
        response = await adminUsersAPI.create(payload);
      }
      console.log("Response:", response);
      const createdAdmin = response.data || response;
      console.log("Admin data:", createdAdmin);
      setSuccess({
        name: createdAdmin.name,
        email: createdAdmin.email,
        id: createdAdmin.id,
      });
      navigate(-1);
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
    {
      name: "role",
      label: "Role",
      type: "select",
      placeholder: "Select a role",
      required: true,
      options:
        roles && roles.length > 0
          ? roles.map((role) => ({
              label: role.name,
              value: role.name,
            }))
          : [],
      disabled: rolesLoading,
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

      {!canEdit && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-900/20">
          <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">
            Info: Cannot Edit Self
          </h3>
          <p className="text-sm text-amber-700 dark:text-amber-400">
            You cannot edit your own account. Please contact another super-admin to make changes to your account.
          </p>
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
              initialValues={
                admin
                  ? {
                      ...admin,
                      is_mailable: toBooleanIsMailable(admin.is_mailable),
                    }
                  : {}
              }
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
