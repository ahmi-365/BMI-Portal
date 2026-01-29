import { Eye, EyeOff, UploadCloud, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import {
  apiCallFormData,
  createResource,
  getResourceById,
  updateResource,
} from "../../services/api";
import PageBreadcrumb from "./PageBreadCrumb";
import SearchableSelect from "./SearchableSelect";

export const ResourceForm = ({
  resourceName,
  fields,
  onSubmitSuccess,
  onSubmit,
  title = "Add Record",
  forceEdit = false,
  extraActions = null,
}) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEditMode = !!id || Boolean(forceEdit);

  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [errors, setErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState({});

  const togglePasswordVisible = (name) => {
    setPasswordVisible((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  useEffect(() => {
    if (isEditMode) {
      loadData();
    }
  }, [id, isEditMode]);

  const loadData = async () => {
    try {
      const data = await getResourceById(resourceName, id);
      if (data) {
        const flat = { ...data };
        if (data.user && data.user.id) flat.user_id = data.user.id;
        if (data.user && data.user.company) flat.company_name = data.user.company;
        
        const isoDateRE = /^\d{4}-\d{2}-\d{2}T/;
        Object.keys(flat).forEach((k) => {
          const v = flat[k];
          if (typeof v === "string" && isoDateRE.test(v)) {
            flat[k] = v.split("T")[0];
          }
        });

        // Resource specific mappings (Legacy support)
        if (resourceName === "invoices" && flat.invoice_doc && !flat.file) flat.file = flat.invoice_doc;
        if (resourceName === "creditnotes" && flat.cn_doc && !flat.file) flat.file = flat.cn_doc;
        if (resourceName === "debitnotes" && flat.dn_doc && !flat.file) flat.file = flat.dn_doc;
        if (resourceName === "ppis" && flat.ppi_doc && !flat.file) flat.file = flat.ppi_doc;

        if (resourceName === "deliveryorders") {
          if (flat.do_doc && !flat.file) flat.file = flat.do_doc;
          if (flat.invoice_id) flat.do_no = flat.invoice_id;
          if (data.invoice && data.invoice.invoiceId) {
            flat.invoice_id = data.invoice.invoiceId;
            flat.invoice_no = data.invoice.invoiceId;
          } else if (flat.invoiceId) {
            flat.invoice_id = flat.invoiceId;
            flat.invoice_no = flat.invoiceId;
          }
        }

        setFormData(pickFieldValues(flat));
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- UPDATED HANDLE CHANGE WITH MAX FILES CHECK ---
  const handleChange = (e, fieldDefinition = null) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "file") {
      const newFiles = files ? Array.from(files) : [];
      
      setFormData((prev) => {
        // Logic for Multiple Files
        if (fieldDefinition?.multiple) {
            const currentFiles = prev[name];
            // Ensure we are working with an array
            const prevArray = Array.isArray(currentFiles) 
              ? currentFiles 
              : (currentFiles ? [currentFiles] : []);
            
            // 🛑 CHECK MAX FILES LIMIT
            if (fieldDefinition.maxFiles) {
                const totalCount = prevArray.length + newFiles.length;
                
                if (totalCount > fieldDefinition.maxFiles) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Limit Exceeded',
                        text: `You can only upload a maximum of ${fieldDefinition.maxFiles} files.`,
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 3000
                    });
                    // Return previous state without adding new files
                    return prev;
                }
            }

            // Append new files
            return {
                ...prev,
                [name]: [...prevArray, ...newFiles]
            };
        }

        // Logic for Single File (Replace)
        return {
          ...prev,
          [name]: newFiles[0] || null,
        };
      });
      
      // Reset input value to allow re-uploading same file if needed
      e.target.value = "";

    } else {
      // Logic for Text/Checkbox/Select
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }

    // Clear validation error on type
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const pickFieldValues = (data = {}) => {
    const allowed = new Set(fields.map((f) => f.name));
    return Object.keys(data).reduce((acc, key) => {
      if (allowed.has(key)) acc[key] = data[key];
      return acc;
    }, {});
  };

  const validateForm = () => {
    const newErrors = {};
    fields.forEach((field) => {
      if (field.required && !formData[field.name]) {
         // Check for empty array if multiple
         if (field.multiple && Array.isArray(formData[field.name]) && formData[field.name].length === 0) {
             newErrors[field.name] = `${field.label} is required`;
         } else if (!formData[field.name]) {
             newErrors[field.name] = `${field.label} is required`;
         }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const renderFileName = (value) => {
    if (!value) return "Upload file";
    if (Array.isArray(value)) {
        if (value.length === 0) return "Upload file";
        return `${value.length} file(s) selected`; 
    }
    return value.name || value; 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please fill in all required fields.",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
      });
      return;
    }

    const payload = pickFieldValues(formData);
    setSubmitLoading(true);
    setErrors({});

    try {
      let result;
      // Check for files
      const hasFile = Object.values(payload).some(v => 
        v instanceof File || (Array.isArray(v) && v.some(item => item instanceof File))
      );

      if (onSubmit) {
        result = await onSubmit(payload);
      } else {
        if (hasFile) {
          const fd = new FormData();
          Object.keys(payload).forEach((key) => {
            const val = payload[key];
            
            if (val instanceof File) {
                fd.append(key, val, val.name);
            } else if (Array.isArray(val) && val.length > 0 && val[0] instanceof File) {
                val.forEach(file => {
                    fd.append(`${key}[]`, file, file.name);
                });
            } else if (val !== undefined && val !== null) {
                fd.append(key, String(val));
            }
          });

          const url = isEditMode ? `/${resourceName}/update/${id}` : `/${resourceName}/create`;
          result = await apiCallFormData(url, fd, "POST");
        } else {
          if (isEditMode) {
            result = await updateResource(resourceName, id, payload);
          } else {
            result = await createResource(resourceName, payload);
          }
        }
      }

      Swal.fire({
        icon: "success",
        title: "Success",
        text: result?.message || "Operation successful!",
        timer: 2000,
        showConfirmButton: false,
      });

      if (onSubmitSuccess) {
        onSubmitSuccess(result);
      } else {
        setFormData({});
        setErrors({});
        setTimeout(() => {
          const returnTo = searchParams.get('returnTo');
          navigate(returnTo ? decodeURIComponent(returnTo) : `/${resourceName}/view`);
        }, 1500);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      const validationErrors = {};
      let alertMessage = "";
      const responseData = error?.response?.data;
      
      if (responseData?.errors) {
        const errorList = [];
        Object.keys(responseData.errors).forEach((key) => {
          const messageArray = responseData.errors[key];
          const message = Array.isArray(messageArray) ? messageArray[0] : messageArray;
          errorList.push(message);
          validationErrors[key] = message;
        });
        alertMessage = errorList.join("\n");
      } 
      
      if (!alertMessage) {
        alertMessage = responseData?.message || error.message || "An unexpected error occurred.";
        validationErrors.submit = alertMessage;
      }

      Swal.fire({
        icon: "error",
        title: "Error",
        html: `<pre style="font-family: inherit; white-space: pre-wrap; color: #d33; font-size: 0.9rem;">${alertMessage}</pre>`,
        confirmButtonColor: "#d33",
      });

      setErrors(validationErrors);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 animate-fadeIn">
      <PageBreadcrumb
        pageTitle={title}
        breadcrumbs={[
          {
            label: resourceName.charAt(0).toUpperCase() + resourceName.slice(1),
            path: `/${resourceName}/view`,
          },
          { label: title },
        ]}
      />
      <div className="rounded-2xl border border-gray-200 bg-white/90 backdrop-blur-lg shadow-xl dark:border-gray-800 dark:bg-gray-900/90 animate-slideIn">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800/60 rounded-t-2xl">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {isEditMode ? "Edit Information" : "Enter Information"}
          </h3>
        </div>

        <div className="p-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              {fields.map((field) => (
                <div
                  key={field.name}
                  className={`${
                    field.colSpan === 2 ? "col-span-1 xl:col-span-2" : ""
                  }`}
                >
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-gray-600 dark:text-gray-300">
                    {field.label}
                    {field.required && <span className="text-red-500">*</span>}
                  </label>

                  {field.type === "textarea" ? (
                    <textarea
                      name={field.name}
                      value={formData[field.name] || ""}
                      onChange={(e) => handleChange(e, field)}
                      placeholder={field.placeholder}
                      rows={4}
                      className={`w-full rounded-xl border-2 bg-white/70 px-4 py-2.5 text-gray-900 outline-none transition-all duration-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 dark:bg-gray-800/70 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-900/30 hover:border-gray-300 dark:hover:border-gray-600 ${
                        errors[field.name]
                          ? "border-red-500 focus:ring-red-100 dark:focus:ring-red-900/30"
                          : "border-gray-200 dark:border-gray-700"
                      }`}
                    />
                  ) : field.type === "file" ? (
                    <div className="w-full">
                      <label className={`group relative flex items-center gap-3 rounded-2xl border-2 border-dashed bg-gradient-to-r from-white/85 via-white to-white/70 px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-100 dark:from-gray-800/80 dark:via-gray-800 dark:to-gray-800/60 dark:focus-within:border-brand-500 dark:focus-within:ring-brand-900/30 cursor-pointer ${
                        errors[field.name]
                          ? "border-red-500 hover:border-red-400"
                          : "border-gray-300 hover:border-brand-300 dark:border-gray-700 dark:hover:border-brand-500/70"
                      }`}>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 shadow-inner transition-all duration-200 group-hover:scale-105 dark:bg-brand-900/30 dark:text-brand-200">
                          <UploadCloud className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col flex-1">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[200px]">
                            {renderFileName(formData[field.name])}
                          </span>
                          {(!formData[field.name] || (Array.isArray(formData[field.name]) && formData[field.name].length === 0)) && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {field.multiple ? "Drag & drop files or click" : "Drag & drop or click to browse"}
                            </span>
                          )}
                        </div>
                        
                        {/* Clear Button Logic */}
                        {(formData[field.name] && (!Array.isArray(formData[field.name]) || formData[field.name].length > 0)) && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setFormData((prev) => ({
                                ...prev,
                                [field.name]: field.multiple ? [] : null,
                              }));
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 transition-all hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                            aria-label="Clear file"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                        <input
                          type="file"
                          name={field.name}
                          multiple={field.multiple} 
                          onChange={(e) => handleChange(e, field)} 
                          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                          aria-label={`Upload ${field.label}`}
                        />
                      </label>
                      {/* Optional: Show list of files if multiple */}
                      {field.multiple && Array.isArray(formData[field.name]) && formData[field.name].length > 0 && (
                          <div className="mt-2 text-xs text-gray-500 space-y-1">
                              {formData[field.name].map((f, i) => (
                                  <div key={i} className="flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                                      {f.name || "Unknown file"}
                                  </div>
                              ))}
                          </div>
                      )}
                    </div>
                  ) : field.type === "date" ? (
                    <input
                      type="date"
                      name={field.name}
                      value={formData[field.name] || ""}
                      onChange={(e) => handleChange(e, field)}
                      className={`w-full rounded-xl border-2 bg-white/70 px-4 py-2.5 text-gray-900 outline-none transition-all duration-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 dark:bg-gray-800/70 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-900/30 hover:border-gray-300 dark:hover:border-gray-600 ${
                        errors[field.name]
                          ? "border-red-500 focus:ring-red-100 dark:focus:ring-red-900/30"
                          : "border-gray-200 dark:border-gray-700"
                      }`}
                    />
                  ) : field.type === "select" ? (
                    field.searchable ? (
                      <SearchableSelect
                        id={`select-${field.name}`}
                        options={field.options || []}
                        value={formData[field.name]}
                        onChange={(v) => {
                          if (field.onChange) {
                            field.onChange(v, setFormData);
                          } else {
                            setFormData((prev) => ({
                              ...prev,
                              [field.name]: v,
                            }));
                          }
                          if (errors[field.name]) {
                            setErrors((prev) => ({ ...prev, [field.name]: "" }));
                          }
                        }}
                        onSearch={field.onSearch}
                        placeholder={field.placeholder || `Select ${field.label}`}
                        className={errors[field.name] ? "border-red-500" : ""}
                      />
                    ) : (
                      <select
                        name={field.name}
                        value={formData[field.name] || ""}
                        onChange={(e) => handleChange(e, field)}
                        className={`relative z-20 w-full appearance-none rounded-xl border-2 bg-white/70 px-4 py-2.5 text-gray-900 outline-none transition-all duration-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 active:border-brand-500 dark:bg-gray-800/70 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-900/30 hover:border-gray-300 dark:hover:border-gray-600 ${
                          errors[field.name]
                            ? "border-red-500 focus:ring-red-100 dark:focus:ring-red-900/30"
                            : "border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        <option value="">Select {field.label}</option>
                        {field.options?.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )
                  ) : field.type === "checkbox" ? (
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name={field.name}
                        checked={formData[field.name] || false}
                        onChange={(e) => handleChange(e, field)}
                        className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-400 dark:border-gray-600 dark:bg-gray-800"
                      />
                      <label
                        htmlFor={field.name}
                        className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-400"
                      >
                        {field.label}
                      </label>
                    </div>
                  ) : field.type === "password-toggle" ? (
                    <div className="relative">
                      <input
                        type={passwordVisible[field.name] ? "text" : "password"}
                        name={field.name}
                        value={formData[field.name] || ""}
                        onChange={(e) => handleChange(e, field)}
                        placeholder={field.placeholder}
                        className={`w-full rounded-xl border-2 bg-white/70 px-4 py-2.5 pr-12 text-gray-900 outline-none transition-all duration-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 dark:bg-gray-800/70 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-900/30 hover:border-gray-300 dark:hover:border-gray-600 ${
                          errors[field.name]
                            ? "border-red-500 focus:ring-red-100 dark:focus:ring-red-900/30"
                            : "border-gray-200 dark:border-gray-700"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisible(field.name)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                        aria-label="Toggle password visibility"
                      >
                        {passwordVisible[field.name] ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  ) : (
                    <input
                      type={field.type || "text"}
                      name={field.name}
                      value={formData[field.name] || ""}
                      onChange={(e) => handleChange(e, field)}
                      placeholder={field.placeholder}
                      readOnly={field.readOnly}
                      disabled={field.disabled}
                      className={`w-full rounded-xl border-2 bg-white/70 px-4 py-2.5 text-gray-900 outline-none transition-all duration-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 active:border-brand-500 disabled:cursor-default disabled:bg-gray-100 dark:bg-gray-800/70 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-900/30 hover:border-gray-300 dark:hover:border-gray-600 read-only:bg-gray-50 read-only:cursor-not-allowed dark:read-only:bg-gray-900/50 ${
                        errors[field.name]
                          ? "border-red-500 focus:ring-red-100 dark:focus:ring-red-900/30"
                          : "border-gray-200 dark:border-gray-700"
                      }`}
                    />
                  )}

                  {errors[field.name] && (
                    <p className="mt-1 text-xs font-medium text-red-500 animate-pulse">
                      {errors[field.name]}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {errors.submit && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400">
                {errors.submit}
              </div>
            )}

            <div className="mt-5 flex justify-end gap-4">
              {extraActions}
              <button
                type="button"
                onClick={() => {
                  const returnTo = searchParams.get('returnTo');
                  navigate(returnTo ? decodeURIComponent(returnTo) : `/${resourceName}/view`);
                }}
                className="px-6 py-3 rounded-xl border-2 border-gray-300 font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:border-gray-500 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitLoading}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 font-semibold text-white shadow-lg hover:shadow-xl hover:from-brand-700 hover:to-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {submitLoading ? "Saving..." : isEditMode ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};