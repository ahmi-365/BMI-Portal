import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createMockData,
  updateMockData,
  getMockDataById,
} from "../../services/api";

export const ResourceForm = ({
  resourceName,
  fields,
  onSubmitSuccess,
  title = "Add Record",
}) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [errors, setErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      loadData();
    }
  }, [id, isEditMode]);

  const loadData = async () => {
    try {
      const data = await getMockDataById(resourceName, id);
      if (data) {
        setFormData(data);
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
      setFormData((prev) => ({
        ...prev,
        [name]: files?.[0]?.name || "",
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

    setSubmitLoading(true);
    try {
      let result;
      if (isEditMode) {
        result = await updateMockData(resourceName, id, formData);
      } else {
        result = await createMockData(resourceName, formData);
      }

      if (onSubmitSuccess) {
        onSubmitSuccess(result);
      } else {
        navigate(`/${resourceName}/view`);
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
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-bold text-black dark:text-white">
          {isEditMode ? `Edit ${title}` : `Add ${title}`}
        </h2>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <h3 className="font-medium text-black dark:text-white">
            {isEditMode ? "Edit Information" : "Enter Information"}
          </h3>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              {fields.map((field) => (
                <div
                  key={field.name}
                  className={`${
                    field.colSpan === 2 ? "col-span-1 xl:col-span-2" : ""
                  }`}
                >
                  <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
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
                      className="w-full rounded-lg border border-gray-300 bg-transparent px-5 py-3 text-black outline-none transition focus:border-brand-500 active:border-brand-500 disabled:cursor-default disabled:bg-whiter dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-brand-500"
                    />
                  ) : field.type === "file" ? (
                    <div className="w-full">
                      <input
                        type="file"
                        name={field.name}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-300 bg-transparent px-5 py-3 text-black outline-none transition focus:border-brand-500 active:border-brand-500 disabled:cursor-default disabled:bg-whiter dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-brand-500 file:mr-4 file:rounded file:border-0 file:bg-brand-500 file:px-3 file:py-2 file:text-white"
                      />
                      {formData[field.name] && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Selected: {formData[field.name]}
                        </p>
                      )}
                    </div>
                  ) : field.type === "date" ? (
                    <input
                      type="date"
                      name={field.name}
                      value={formData[field.name] || ""}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 bg-transparent px-5 py-3 text-black outline-none transition focus:border-brand-500 active:border-brand-500 disabled:cursor-default disabled:bg-whiter dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-brand-500"
                    />
                  ) : field.type === "select" ? (
                    <select
                      name={field.name}
                      value={formData[field.name] || ""}
                      onChange={handleChange}
                      className="relative z-20 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-5 py-3 text-black outline-none transition focus:border-brand-500 active:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-brand-500"
                    >
                      <option value="">Select {field.label}</option>
                      {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "checkbox" ? (
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name={field.name}
                        checked={formData[field.name] || false}
                        onChange={handleChange}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <label
                        htmlFor={field.name}
                        className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-400"
                      >
                        {field.label}
                      </label>
                    </div>
                  ) : (
                    <input
                      type={field.type || "text"}
                      name={field.name}
                      value={formData[field.name] || ""}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      className="w-full rounded-lg border border-gray-300 bg-transparent px-5 py-3 text-black outline-none transition focus:border-brand-500 active:border-brand-500 disabled:cursor-default disabled:bg-whiter dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-brand-500"
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

            <div className="mt-6 flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate(`/${resourceName}/view`)}
                className="flex justify-center rounded-lg border border-stroke px-6 py-2.5 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitLoading}
                className="flex justify-center rounded-lg bg-brand-500 px-6 py-2.5 font-medium text-gray-100 hover:bg-opacity-90 disabled:opacity-50"
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
