import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getResourceById } from "../../services/api";

export const ShowPage = ({ resourceName, fields, title = "Details" }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const result = await getResourceById(resourceName, id);
      setData(result);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="rounded-lg bg-red-50 p-4 text-red-800">
          Record not found
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 animate-fade-in-up">
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate(`/${resourceName}/view`)}
          className="flex items-center gap-2 text-brand-500 hover:text-brand-600 dark:text-brand-400"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to List
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-theme-sm dark:border-gray-800 dark:bg-gray-900 animate-slide-up">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <h2 className="text-xl font-bold text-black dark:text-white">
            {title} Details
          </h2>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  {field.label}
                </label>
                <div className="text-gray-900 dark:text-white break-words">
                  {field.type === "checkbox" ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">
                      {data[field.name] ? "Yes" : "No"}
                    </span>
                  ) : field.render ? (
                    // Pass both the field value and the whole record to render functions
                    field.render(data[field.name], data)
                  ) : (
                    data[field.name] || "-"
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-between gap-4 pt-6 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={() => navigate(`/${resourceName}/view`)}
              className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:text-white dark:hover:bg-gray-800"
            >
              Close
            </button>
            <button
              onClick={() => navigate(`/${resourceName}/edit/${id}`)}
              className="px-6 py-2.5 rounded-lg bg-brand-500 text-white hover:bg-brand-600"
            >
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
