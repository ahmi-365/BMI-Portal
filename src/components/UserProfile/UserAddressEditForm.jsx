import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { apiCallFormData } from "../../services/api";
import Toast from "../common/Toast";

// --- Minimalist Icons ---
const Icons = {
  Back: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  ),
  Upload: () => (
    <svg className="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  ),
  File: () => (
    <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
};

// --- Updated File Upload (Transparent Background) ---
const FileUploadField = ({ label, name, onChange, selectedFile }) => (
  <div className="w-full">
    <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      {label}
    </Label>
    <label className="flex flex-col items-center justify-center w-full h-24 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-transparent hover:border-gray-400 dark:hover:border-gray-500 transition-all group">
      <div className="flex flex-col items-center justify-center pt-2 pb-3">
        {selectedFile ? (
          <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm">
            <Icons.File />
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium truncate max-w-[150px]">
              {selectedFile.name}
            </p>
          </div>
        ) : (
          <>
            <Icons.Upload />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
              <span className="font-medium text-gray-700 dark:text-gray-300">Click to upload</span> or drag file
            </p>
          </>
        )}
      </div>
      <input type="file" name={name} className="hidden" onChange={onChange} />
    </label>
  </div>
);

export default function UserAddressEditForm({ userData, onBack }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const initialState = {
    name: "", company: "", email: "", phone: "", address: "",
    email2: "", email3: "",
    cc1: null, form_24: null, financial_statement: null, form_9: null, pdpa: null,
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
        cc1: null, form_24: null, financial_statement: null, form_9: null, pdpa: null,
      });
    }
  }, [userData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
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
        cc1: { type: "file", value: formData.cc1 },
        form_24: { type: "file", value: formData.form_24 },
        financial_statement: { type: "file", value: formData.financial_statement },
        form_9: { type: "file", value: formData.form_9 },
        pdpa: { type: "file", value: formData.pdpa },
      };

      Object.keys(fieldMappings).forEach((key) => {
        const field = fieldMappings[key];
        if (field.value !== null && field.value !== "") {
          payload.append(key, field.value);
        }
      });

      const response = await apiCallFormData("/user/profile/update", payload, "POST");

      if (response.ok || response.success) {
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
          <form onSubmit={handleSave} className="divide-y divide-gray-100 dark:divide-gray-800">
            
            {/* Section 1: Personal Info */}
            <div className="p-8">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-6">
                Personal Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</Label>
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
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</Label>
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
                  <Label htmlFor="company" className="text-sm font-medium text-gray-700 dark:text-gray-300">Company Name</Label>
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
                  <Label htmlFor="address" className="text-sm font-medium text-gray-700 dark:text-gray-300">Office Address</Label>
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
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">Primary Email</Label>
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
                    <Label htmlFor="email2" className="text-sm font-medium text-gray-700 dark:text-gray-300">Secondary Email <span className="text-gray-400 font-normal">(Optional)</span></Label>
                    <Input id="email2" name="email2" type="email" value={formData.email2} onChange={handleInputChange} className="w-full bg-transparent border-gray-300 dark:border-gray-700 rounded-md focus:ring-gray-900 dark:focus:ring-gray-500 focus:border-gray-900 dark:text-white dark:placeholder-gray-500" />
                    </div>
                    <div className="space-y-1">
                    <Label htmlFor="email3" className="text-sm font-medium text-gray-700 dark:text-gray-300">Tertiary Email <span className="text-gray-400 font-normal">(Optional)</span></Label>
                    <Input id="email3" name="email3" type="email" value={formData.email3} onChange={handleInputChange} className="w-full bg-transparent border-gray-300 dark:border-gray-700 rounded-md focus:ring-gray-900 dark:focus:ring-gray-500 focus:border-gray-900 dark:text-white dark:placeholder-gray-500" />
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
                 <FileUploadField label="Credit Application (CC1)" name="cc1" onChange={handleFileChange} selectedFile={formData.cc1} />
                 <FileUploadField label="Form 24" name="form_24" onChange={handleFileChange} selectedFile={formData.form_24} />
                 <FileUploadField label="Financial Statement" name="financial_statement" onChange={handleFileChange} selectedFile={formData.financial_statement} />
                 <FileUploadField label="Form 9" name="form_9" onChange={handleFileChange} selectedFile={formData.form_9} />
                 <FileUploadField label="PDPA" name="pdpa" onChange={handleFileChange} selectedFile={formData.pdpa} />
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