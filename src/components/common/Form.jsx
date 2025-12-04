import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const Form = ({
  fields,
  onSubmit,
  submitLabel = "Submit",
  initialValues = {},
}) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const initialData = { ...initialValues };
    fields.forEach((field) => {
      if (initialData[field.name] === undefined) {
        initialData[field.name] =
          field.defaultValue ?? (field.type === "toggle" ? false : "");
      }
    });
    setFormData(initialData);
  }, [fields, initialValues]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) : value,
    }));
  };

  const handleToggleChange = (name) => {
    setFormData((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {fields.map((field, index) => (
          <div
            key={index}
            className={`${
              field.colSpan === 2 ? "col-span-1 xl:col-span-2" : "col-span-1"
            }`}
          >
            <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
              {field.label}{" "}
              {field.required && <span className="text-red-500">*</span>}
            </label>

            {field.type === "select" ? (
              <div className="relative z-20 bg-transparent dark:bg-gray-800">
                <select
                  name={field.name}
                  value={formData[field.name] || ""}
                  onChange={handleChange}
                  required={field.required}
                  className="relative z-20 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-5 py-3 text-black outline-none transition focus:border-brand-500 active:border-brand-500 dark:border-gray-700 dark:text-white dark:focus:border-brand-500"
                >
                  <option value="" disabled>
                    Select an option
                  </option>
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <span className="absolute right-4 top-1/2 z-30 -translate-y-1/2">
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                </span>
              </div>
            ) : field.type === "textarea" ? (
              <textarea
                name={field.name}
                rows={4}
                value={formData[field.name] || ""}
                onChange={handleChange}
                placeholder={field.placeholder}
                required={field.required}
                className="w-full rounded-lg border border-gray-300 bg-transparent px-5 py-3 text-black outline-none transition focus:border-brand-500 active:border-brand-500 disabled:cursor-default disabled:bg-whiter dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-brand-500"
              />
            ) : field.type === "toggle" ? (
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {field.placeholder || "Toggle status"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleChange(field.name)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    formData[field.name]
                      ? "bg-brand-500"
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                  role="switch"
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      formData[field.name] ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            ) : (
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name] || ""}
                onChange={handleChange}
                placeholder={field.placeholder}
                required={field.required}
                className="w-full rounded-lg border border-gray-300 bg-transparent px-5 py-3 text-black outline-none transition focus:border-brand-500 active:border-brand-500 disabled:cursor-default disabled:bg-whiter dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-brand-500"
              />
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <button
          type="button"
          className="flex justify-center rounded-lg border border-stroke px-6 py-2.5 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex justify-center rounded-lg bg-brand-500 px-6 py-2.5 font-medium text-gray-100 hover:bg-opacity-90"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

export default Form;
