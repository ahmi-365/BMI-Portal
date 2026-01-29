import { useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ResourceForm } from "../../components/common/ResourceForm";
import { customersAPI } from "../../services/api";

// Change Password Modal Component
function ChangePasswordModal({ isOpen, onClose, userId }) {
  const [formData, setFormData] = useState({
    new_pass: "",
    repeat_new_pass: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.new_pass) {
      newErrors.new_pass = "New password is required";
    } else if (formData.new_pass.length < 6) {
      newErrors.new_pass = "Password must be at least 6 characters";
    }
    if (!formData.repeat_new_pass) {
      newErrors.repeat_new_pass = "Please confirm your password";
    } else if (formData.new_pass !== formData.repeat_new_pass) {
      newErrors.repeat_new_pass = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await customersAPI.changePassword({
        user_id: userId,
        new_pass: formData.new_pass,
        repeat_new_pass: formData.repeat_new_pass,
      });
      toast.success("Password changed successfully");
      setFormData({ new_pass: "", repeat_new_pass: "" });
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="relative z-50 w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Change Password
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              New Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="new_pass"
              value={formData.new_pass}
              onChange={handleChange}
              className={`w-full rounded-lg border px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-white ${
                errors.new_pass
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              }`}
              placeholder="Enter new password"
            />
            {errors.new_pass && (
              <p className="mt-1 text-sm text-red-500">{errors.new_pass}</p>
            )}
          </div>

          <div className="mb-6">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Confirm New Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="repeat_new_pass"
              value={formData.repeat_new_pass}
              onChange={handleChange}
              className={`w-full rounded-lg border px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-white ${
                errors.repeat_new_pass
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              }`}
              placeholder="Confirm new password"
            />
            {errors.repeat_new_pass && (
              <p className="mt-1 text-sm text-red-500">
                {errors.repeat_new_pass}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CustomersAdd() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const FIELDS = [
    {
      name: "name",
      label: "Company/Business Name",
      type: "text",
      required: true,
    },
    {
      name: "company",
      label: "Business Contact Name",
      type: "text",
      required: true,
    },
    {
      name: "email",
      label: "Business E-mail (Primary)",
      type: "email",
      required: true,
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      required: !isEditMode,
    },
    {
      name: "password_confirmation",
      label: "Repeat Password",
      type: "password",
      required: !isEditMode,
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      options: [
        { value: "1", label: "Active" },
        { value: "0", label: "Pending" },
      ],
    },
    { name: "customer_no", label: "Customer No.", type: "text" },
    { name: "phone", label: "Phone", type: "text" },
    { name: "address", label: "Billing Address", type: "textarea" },
    { name: "email2", label: "Business E-mail 2", type: "email" },
    { name: "email3", label: "Business E-mail 3", type: "email" },
    {
      name: "payment_term",
      label: "Payment Term (EOM)",
      type: "number",
    },

    // --- UPDATED FILE UPLOAD SECTION ---
    {
      name: "credit_application_files", // Grouped CC1/CC2
      label: "Upload Credit Application Form (CC1/CC2)",
      type: "file",
      multiple: true,
      maxFiles: 2, // Hint for ResourceForm
    },
    {
      name: "registration_files", // Grouped Form 9/24/49
      label: "Upload Company Registration Form (9/24/49)",
      type: "file",
      multiple: true,
      maxFiles: 3, // Hint for ResourceForm
    },
    {
      name: "letter_of_guarantee",
      label: "Letter of Guarantee",
      type: "file",
    },
    // {
    //   name: "financial_statement",
    //   label: "Upload Financial Statements",
    //   type: "file"
    // },
    {
      name: "pdpa",
      label: "Upload PDPA/Consent Letter",
      type: "file",
    },
  ];

  const handleSubmit = async (formData) => {
    // Build FormData for file uploads
    const fd = new FormData();
    Object.keys(formData).forEach((key) => {
      const val = formData[key];

      // Skip blank passwords during edit
      if ((key === "password" || key === "password_confirmation") && !val) {
        return;
      }

      // Handle Multiple Files (FileList, Array of Files, or Array with URLs)
      if (val instanceof FileList) {
        // Convert FileList to Array and append each
        Array.from(val).forEach((file) => {
          fd.append(`${key}[]`, file, file.name);
        });
      } else if (Array.isArray(val) && val.length > 0) {
        // Separate files and URLs
        const newFiles = val.filter((item) => item instanceof File);
        const existingUrls = val.filter((item) => typeof item === "string");

        // Append new files
        newFiles.forEach((file) => {
          fd.append(`${key}[]`, file, file.name);
        });

        // Append existing URLs (to keep them)
        existingUrls.forEach((url) => {
          fd.append(`${key}[]`, url);
        });
      }
      // Handle Single File
      else if (val instanceof File) {
        fd.append(key, val, val.name);
      }
      // Handle Text Data
      else if (val !== undefined && val !== null && val !== "") {
        fd.append(key, String(val));
      }
    });

    if (isEditMode) {
      return await customersAPI.update(id, fd);
    }
    return await customersAPI.create(fd);
  };

  return (
    <>
      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        userId={id}
      />

      <ResourceForm
        resourceName="customers"
        fields={FIELDS}
        title={isEditMode ? "Edit Customer" : "New Customer"}
        onSubmit={handleSubmit}
        extraActions={
          isEditMode ? (
            <button
              type="button"
              onClick={() => setShowPasswordModal(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-amber-500 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100 dark:border-amber-600 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/40"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
              Change Password
            </button>
          ) : null
        }
      />
    </>
  );
}
