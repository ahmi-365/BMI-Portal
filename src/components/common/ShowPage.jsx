import { Edit, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import { getResourceById } from "../../services/api";
import PageBreadcrumb from "./PageBreadCrumb";

export const ShowPage = ({
  resourceName,
  fields,
  title = "Details",
  showEdit = true,
  showDelete = false,
  backPath,
  apiCall,
  onDelete,
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const result = apiCall
        ? await apiCall(id)
        : await getResourceById(resourceName, id);
      setData(result?.data || result);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Determine if edit button should be shown
  const shouldShowEdit =
    showEdit &&
    !(
      resourceName === "payments" &&
      (data?.status === 0 || data?.status === 1)
    );
  const shouldShowDelete = showDelete && typeof onDelete === "function";

  const handleDelete = async () => {
    const confirmed = await Swal.fire({
      icon: "warning",
      title: "Delete Record?",
      text: `This will permanently delete this ${title.toLowerCase()}.`,
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Delete",
    });

    if (!confirmed.isConfirmed) return;

    try {
      await onDelete(id);
      Swal.fire({
        icon: "success",
        title: "Deleted",
        text: `${title} deleted successfully.`,
        timer: 1800,
        showConfirmButton: false,
      });

      if (returnTo) {
        navigate(decodeURIComponent(returnTo));
      } else {
        navigate(backPath || `/${resourceName}/view`);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Delete failed",
        text: error?.message || `Failed to delete ${title.toLowerCase()}.`,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Loading details...
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="rounded-2xl bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 p-6 text-red-800 dark:from-red-900/20 dark:to-red-900/10 dark:border-red-800/50 dark:text-red-400">
          <div className="flex items-center gap-3">
            <X className="w-6 h-6" />
            <span className="font-semibold">Record not found</span>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-6xl mx-auto p-6 animate-fadeIn">
      {/* Breadcrumb Navigation */}
      <PageBreadcrumb
        pageTitle={title}
        breadcrumbs={[
          {
            label: resourceName.charAt(0).toUpperCase() + resourceName.slice(1),
            path: `/${resourceName}/view`,
          },
          { label: `View ${title}` },
        ]}
      />

      {/* Compact Header with Actions */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Record ID: {id}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {shouldShowDelete && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 font-medium text-red-700 transition-all duration-200 hover:bg-red-100 hover:shadow-lg dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}
          {shouldShowEdit && (
            <button
              onClick={() => {
                const editUrl = returnTo
                  ? `/${resourceName}/edit/${id}?returnTo=${returnTo}`
                  : `/${resourceName}/edit/${id}`;
                navigate(editUrl);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white font-medium hover:bg-brand-700 hover:shadow-lg transition-all duration-200"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Clean Table Layout */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 overflow-hidden animate-slideIn">
        <div className="overflow-x-auto">
          <table className="w-full">
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {fields.map((field, index) => (
                <tr
                  key={field.name}
                  className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 w-1/3 bg-gray-50/50 dark:bg-gray-800/50">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {field.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {field.type === "checkbox" ? (
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${
                            data[field.name]
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                          }`}
                        >
                          {data[field.name] ? "Yes" : "No"}
                        </span>
                      ) : field.render ? (
                        field.render(data[field.name], data)
                      ) : (
                        <span className="font-medium">
                          {data[field.name] || (
                            <span className="text-gray-400 italic font-normal">
                              —
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50/50 border-t border-gray-100 dark:bg-gray-800/50 dark:border-gray-800">
          <button
            onClick={() => {
              if (returnTo) {
                navigate(decodeURIComponent(returnTo));
              } else {
                navigate(backPath || `/${resourceName}/view`);
              }
            }}
            className="px-5 py-2.5 rounded-xl border border-gray-300 font-medium text-gray-700 hover:bg-white hover:border-gray-400 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:border-gray-500 transition-all duration-200"
          >
            Close
          </button>
          {shouldShowDelete && (
            <button
              onClick={handleDelete}
              className="px-5 py-2.5 rounded-xl border border-red-200 bg-red-50 font-medium text-red-700 hover:bg-red-100 transition-all duration-200 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300"
            >
              Delete Record
            </button>
          )}
          {shouldShowEdit && (
            <button
              onClick={() => {
                const editUrl = returnTo
                  ? `/${resourceName}/edit/${id}?returnTo=${encodeURIComponent(returnTo)}`
                  : `/${resourceName}/edit/${id}`;
                navigate(editUrl);
              }}
              className="px-5 py-2.5 rounded-xl bg-brand-600 font-medium text-white hover:bg-brand-700 transition-all duration-200"
            >
              Edit Record
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
