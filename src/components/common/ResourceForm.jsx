import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createResource,
  updateResource,
  getResourceById,
  apiCallFormData,
} from "../../services/api";
import SearchableSelect from "./SearchableSelect";
import PageBreadcrumb from "./PageBreadCrumb";
import { Eye, EyeOff, UploadCloud, X } from "lucide-react";

export const ResourceForm = ({
  resourceName,
  fields,
  onSubmitSuccess,
  onSubmit,
  title = "Add Record",
  // When true, treat form as edit mode even if no :id param is present
  forceEdit = false,
}) => {
  const navigate = useNavigate();
  const { id } = useParams();
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
        // Flatten some nested relations so form fields can bind to simple names
        const flat = { ...data };
        if (data.user && data.user.id) flat.user_id = data.user.id;
        if (data.user && data.user.company)
          flat.company_name = data.user.company;
        // Normalize ISO datetime strings to YYYY-MM-DD for date inputs
        const isoDateRE = /^\d{4}-\d{2}-\d{2}T/;
        Object.keys(flat).forEach((k) => {
          const v = flat[k];
          if (typeof v === "string" && isoDateRE.test(v)) {
            flat[k] = v.split("T")[0];
          }
        });
        setFormData(pickFieldValues(flat));
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "file") {
      // store the File object so callers can build FormData when needed
      setFormData((prev) => ({
        ...prev,
        [name]: files?.[0] || null,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
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
        newErrors[field.name] = `${field.label} is required`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }
    const payload = pickFieldValues(formData);
    console.log("Submitting form data:", payload);
    setSubmitLoading(true);
    try {
      let result;
      if (onSubmit) {
        // Allow callers to override submit behavior (useful for FormData/file uploads)
        result = await onSubmit(payload);
      } else if (isEditMode) {
        // If any File objects are present, submit as multipart/form-data
        const hasFile = Object.values(payload).some((v) => v instanceof File);
        if (hasFile) {
          const fd = new FormData();
          Object.keys(payload).forEach((key) => {
            const val = payload[key];
            if (val instanceof File) fd.append(key, val, val.name);
            else if (val !== undefined && val !== null)
              fd.append(key, String(val));
          });
          result = await apiCallFormData(
            `/${resourceName}/update/${id}`,
            fd,
            "POST"
          );
        } else {
          result = await updateResource(resourceName, id, payload);
        }
      } else {
        const hasFile = Object.values(payload).some((v) => v instanceof File);
        if (hasFile) {
          const fd = new FormData();
          Object.keys(payload).forEach((key) => {
            const val = payload[key];
            if (val instanceof File) fd.append(key, val, val.name);
            else if (val !== undefined && val !== null)
              fd.append(key, String(val));
          });
          result = await apiCallFormData(`/${resourceName}/create`, fd, "POST");
        } else {
          result = await createResource(resourceName, payload);
        }
      }

      if (onSubmitSuccess) {
        onSubmitSuccess(result);
      } else {
        navigate(`/${resourceName}/view`);
        // window.location.reload();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrors({ submit: "Error submitting form. Please try again." });
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
      {" "}
      {/* Breadcrumb Navigation */}
      <PageBreadcrumb
        pageTitle={isEditMode ? `Edit ${title}` : `Add ${title}`}
        breadcrumbs={[
          {
            label: resourceName.charAt(0).toUpperCase() + resourceName.slice(1),
            path: `/${resourceName}/view`,
          },
          { label: isEditMode ? `Edit ${title}` : `Add ${title}` },
        ]}
      />
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
            {isEditMode ? "Edit" : "Create"}
          </p>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
            {isEditMode ? `Edit ${title}` : `Add ${title}`}
          </h2>
        </div>
      </div>
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
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      rows={4}
                      className="w-full rounded-xl border-2 border-gray-200 bg-white/70 px-4 py-2.5 text-gray-900 outline-none transition-all duration-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 dark:border-gray-700 dark:bg-gray-800/70 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-900/30 hover:border-gray-300 dark:hover:border-gray-600"
                    />
                  ) : field.type === "file" ? (
                    <div className="w-full">
                      <label className="group relative flex items-center gap-3 rounded-2xl border-2 border-dashed border-gray-300 bg-gradient-to-r from-white/85 via-white to-white/70 px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-100 dark:border-gray-700 dark:from-gray-800/80 dark:via-gray-800 dark:to-gray-800/60 dark:hover:border-brand-500/70 dark:focus-within:border-brand-500 dark:focus-within:ring-brand-900/30 cursor-pointer">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 shadow-inner transition-all duration-200 group-hover:scale-105 dark:bg-brand-900/30 dark:text-brand-200">
                          <UploadCloud className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col flex-1">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {formData[field.name]?.name ||
                              formData[field.name] ||
                              "Upload file"}
                          </span>
                          {!formData[field.name] && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Drag & drop or click to browse
                            </span>
                          )}
                        </div>
                        {formData[field.name] && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setFormData((prev) => ({
                                ...prev,
                                [field.name]: null,
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
                          onChange={handleChange}
                          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                          aria-label={`Upload ${field.label}`}
                        />
                      </label>
                    </div>
                  ) : field.type === "date" ? (
                    <input
                      type="date"
                      name={field.name}
                      value={formData[field.name] || ""}
                      onChange={handleChange}
                      className="w-full rounded-xl border-2 border-gray-200 bg-white/70 px-4 py-2.5 text-gray-900 outline-none transition-all duration-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 dark:border-gray-700 dark:bg-gray-800/70 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-900/30 hover:border-gray-300 dark:hover:border-gray-600"
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
                        }}
                        onSearch={field.onSearch}
                        placeholder={
                          field.placeholder || `Select ${field.label}`
                        }
                      />
                    ) : (
                      <select
                        name={field.name}
                        value={formData[field.name] || ""}
                        onChange={handleChange}
                        className="relative z-20 w-full appearance-none rounded-xl border-2 border-gray-200 bg-white/70 px-4 py-2.5 text-gray-900 outline-none transition-all duration-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 active:border-brand-500 dark:border-gray-700 dark:bg-gray-800/70 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-900/30 hover:border-gray-300 dark:hover:border-gray-600"
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
                        onChange={handleChange}
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
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        className="w-full rounded-xl border-2 border-gray-200 bg-white/70 px-4 py-2.5 pr-12 text-gray-900 outline-none transition-all duration-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 dark:border-gray-700 dark:bg-gray-800/70 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-900/30 hover:border-gray-300 dark:hover:border-gray-600"
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
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      readOnly={field.readOnly}
                      className="w-full rounded-xl border-2 border-gray-200 bg-white/70 px-4 py-2.5 text-gray-900 outline-none transition-all duration-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 active:border-brand-500 disabled:cursor-default disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800/70 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-900/30 hover:border-gray-300 dark:hover:border-gray-600 read-only:bg-gray-50 read-only:cursor-not-allowed dark:read-only:bg-gray-900/50"
                    />
                  )}

                  {errors[field.name] && (
                    <p className="mt-1 text-xs text-red-500">
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
              <button
                type="button"
                onClick={() => navigate(`/${resourceName}/view`)}
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
