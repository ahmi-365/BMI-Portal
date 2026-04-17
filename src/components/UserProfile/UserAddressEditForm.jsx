import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { userAuthAPI } from "../../services/api";
import Toast from "../common/Toast";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Button from "../ui/button/Button";

// --- Minimalist Icons ---
const Icons = {
  Back: () => (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M10 19l-7-7m0 0l7-7m-7 7h18"
      />
    </svg>
  ),
  Upload: () => (
    <svg
      className="w-6 h-6 text-gray-400 dark:text-gray-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
      />
    </svg>
  ),
  File: () => (
    <svg
      className="w-5 h-5 text-gray-500 dark:text-gray-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  ),
};

const getFileName = (value) => {
  if (!value) return null;
  if (value instanceof File) return value.name;
  if (typeof value === "string") {
    const urlParts = value.split("/");
    const last = urlParts[urlParts.length - 1] || "";
    return decodeURIComponent(last.split("?")[0]) || "Existing file";
  }
  return null;
};

// --- Updated File Upload (Transparent Background) ---
const FileUploadField = ({
  label,
  name,
  onChange,
  selectedFile,
  multiple = false,
}) => {
  const selectedFiles = Array.isArray(selectedFile)
    ? selectedFile
    : selectedFile
      ? [selectedFile]
      : [];

  return (
    <div className="w-full">
      <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </Label>
      <label className="flex flex-col items-center justify-center w-full h-24 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-transparent hover:border-gray-400 dark:hover:border-gray-500 transition-all group">
        <div className="flex flex-col items-center justify-center pt-2 pb-3 w-full px-2">
          {selectedFiles.length > 0 ? (
            <div className="w-full space-y-1">
              {selectedFiles.slice(0, 2).map((fileItem, index) => {
                const fileName = getFileName(fileItem);
                return (
                  <div
                    key={`${name}-${index}`}
                    className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm"
                  >
                    <Icons.File />
                    {typeof fileItem === "string" ? (
                      <a
                        href={fileItem}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 dark:text-blue-400 font-medium truncate max-w-[150px] hover:underline"
                      >
                        {fileName}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-700 dark:text-gray-300 font-medium truncate max-w-[150px]">
                        {fileName}
                      </p>
                    )}
                  </div>
                );
              })}
              {selectedFiles.length > 2 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  +{selectedFiles.length - 2} more file(s)
                </p>
              )}
            </div>
          ) : (
            <>
              <Icons.Upload />
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors text-center">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Click to upload
                </span>{" "}
                {multiple ? "files" : "a file"}
              </p>
            </>
          )}
        </div>
        <input
          type="file"
          name={name}
          multiple={multiple}
          className="hidden"
          onChange={onChange}
        />
      </label>
    </div>
  );
};

export default function UserAddressEditForm({ userData, onBack }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const initialState = {
    name: "",
    company: "",
    email: "",
    phone: "",
    address: "",
    email2: "",
    email3: "",
    letter_of_guarantee: null,
    credit_application_files: [],
    registration_files: [],
    pdpa: null,
  };

  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData?.name || "",
        company: userData?.company || "",
        email: userData?.email || "",
        phone: userData?.phone || "",
        address: userData?.address || "",
        email2: userData?.email2 || "",
        email3: userData?.email3 || "",
        letter_of_guarantee: userData?.letter_of_guarantee || null,
        credit_application_files: Array.isArray(
          userData?.credit_application_files,
        )
          ? userData.credit_application_files
          : [],
        registration_files: Array.isArray(userData?.registration_files)
          ? userData.registration_files
          : [],
        pdpa: userData?.pdpa || null,
      });
    }
  }, [userData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === "credit_application_files" || name === "registration_files") {
      setFormData((prev) => ({ ...prev, [name]: Array.from(files || []) }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: files?.[0] || null }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = new FormData();
      const fieldMappings = {
        name: { type: "text", value: formData.name },
        company: { type: "text", value: formData.company },
        email: { type: "text", value: formData.email },
        phone: { type: "text", value: formData.phone },
        address: { type: "text", value: formData.address },
        email2: { type: "text", value: formData.email2 },
        email3: { type: "text", value: formData.email3 },
        letter_of_guarantee: {
          type: "file",
          value: formData.letter_of_guarantee,
        },
        credit_application_files: {
          type: "multi-file",
          value: formData.credit_application_files,
        },
        registration_files: {
          type: "multi-file",
          value: formData.registration_files,
        },
        pdpa: { type: "file", value: formData.pdpa },
      };

      Object.keys(fieldMappings).forEach((key) => {
        const field = fieldMappings[key];
        if (field.type === "multi-file") {
          const files = Array.isArray(field.value)
            ? field.value.filter((item) => item instanceof File)
            : [];
          files.forEach((file) => payload.append(`${key}[]`, file));
          return;
        }

        if (field.type === "file") {
          if (field.value instanceof File) {
            payload.append(key, field.value);
          }
          return;
        }

        if (field.value !== null && field.value !== "") {
          payload.append(key, field.value);
        }
      });

      const response = await userAuthAPI.updateProfile(payload);

      if (response?.status === true || response?.success || response?.ok) {
        Toast.success("Profile updated successfully");
        onBack?.();
      } else {
        Toast.error(response.message || "Failed to update profile");
      }
    } catch (error) {
      Toast.error(error.message || "Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen  py-4 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Simple Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">
              Edit Profile
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage your personal and company details.
            </p>
          </div>
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <Icons.Back />
            Cancel
          </button>
        </div>

        {/* Clean Form Card - removed bg-white, kept dark mode compatibility */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
          <form
            onSubmit={handleSave}
            className="divide-y divide-gray-100 dark:divide-gray-800"
          >
            {/* Section 1: Personal Info */}
            <div className="p-8">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-6">
                Personal Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <Label
                    htmlFor="name"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. John Doe"
                    required
                    className="w-full bg-transparent border-gray-300 dark:border-gray-700 rounded-md focus:ring-gray-900 dark:focus:ring-gray-500 focus:border-gray-900 dark:text-white dark:placeholder-gray-500 transition-shadow"
                  />
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor="phone"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-transparent border-gray-300 dark:border-gray-700 rounded-md focus:ring-gray-900 dark:focus:ring-gray-500 focus:border-gray-900 dark:text-white dark:placeholder-gray-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Company Info */}
            <div className="p-8">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-6">
                Company Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <Label
                    htmlFor="company"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Company Name
                  </Label>
                  <Input
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-transparent border-gray-300 dark:border-gray-700 rounded-md focus:ring-gray-900 dark:focus:ring-gray-500 focus:border-gray-900 dark:text-white dark:placeholder-gray-500"
                  />
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor="address"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Office Address
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-transparent border-gray-300 dark:border-gray-700 rounded-md focus:ring-gray-900 dark:focus:ring-gray-500 focus:border-gray-900 dark:text-white dark:placeholder-gray-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Contact Details */}
            <div className="p-8">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-6">
                Contact Emails
              </h3>
              <div className="space-y-4 max-w-2xl">
                <div className="space-y-1">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Primary Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-transparent border-gray-300 dark:border-gray-700 rounded-md focus:ring-gray-900 dark:focus:ring-gray-500 focus:border-gray-900 dark:text-white dark:placeholder-gray-500"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <Label
                      htmlFor="email2"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Secondary Email{" "}
                      <span className="text-gray-400 font-normal">
                        (Optional)
                      </span>
                    </Label>
                    <Input
                      id="email2"
                      name="email2"
                      type="email"
                      value={formData.email2}
                      onChange={handleInputChange}
                      className="w-full bg-transparent border-gray-300 dark:border-gray-700 rounded-md focus:ring-gray-900 dark:focus:ring-gray-500 focus:border-gray-900 dark:text-white dark:placeholder-gray-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label
                      htmlFor="email3"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Tertiary Email{" "}
                      <span className="text-gray-400 font-normal">
                        (Optional)
                      </span>
                    </Label>
                    <Input
                      id="email3"
                      name="email3"
                      type="email"
                      value={formData.email3}
                      onChange={handleInputChange}
                      className="w-full bg-transparent border-gray-300 dark:border-gray-700 rounded-md focus:ring-gray-900 dark:focus:ring-gray-500 focus:border-gray-900 dark:text-white dark:placeholder-gray-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Documents (Fixed Backgrounds) */}
            <div className="p-8">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-6">
                Required Documents
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FileUploadField
                  label="Letter of Guarantee"
                  name="letter_of_guarantee"
                  onChange={handleFileChange}
                  selectedFile={formData.letter_of_guarantee}
                />
                <FileUploadField
                  label="Credit Application Files"
                  name="credit_application_files"
                  onChange={handleFileChange}
                  selectedFile={formData.credit_application_files}
                  multiple
                />
                <FileUploadField
                  label="Registration Files"
                  name="registration_files"
                  onChange={handleFileChange}
                  selectedFile={formData.registration_files}
                  multiple
                />
                <FileUploadField
                  label="PDPA"
                  name="pdpa"
                  onChange={handleFileChange}
                  selectedFile={formData.pdpa}
                />
              </div>
            </div>

            {/* Footer / Actions - Fixed Cancel Button Visibility */}
            <div className="px-8 py-5 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-3 rounded-b-lg border-t border-gray-100 dark:border-gray-800">
              <Button
                type="button"
                onClick={onBack}
                // Updated class: transparent bg, light border/text for dark mode
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-transparent border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus:outline-none"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 dark:bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-black dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 transition-colors"
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
