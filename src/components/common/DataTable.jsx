import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Modal } from "../ui/modal"; // Ensure this path is correct for your project
import { deleteResource } from "../../services/api";

export const DataTable = ({
  columns,
  data,
  resourceName,
  onRefresh,
  onDelete,
  // New props for filtering
  showFilters,
  filters,
  onFilterChange,
}) => {
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Internal handlers (if your columns use them, or if you pass these down)
  const handleView = (row) => {
    navigate(`/${resourceName}/show/${row.id}`);
  };

  const handleEdit = (row) => {
    navigate(`/${resourceName}/edit/${row.id}`);
  };

  const handleDeleteClick = (row) => {
    setSelectedRow(row);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedRow) return;

    setIsLoading(true);
    try {
      await deleteResource(resourceName, selectedRow.id);
      setIsDeleteModalOpen(false);
      setSelectedRow(null);
      if (onDelete) {
        onDelete();
      }
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("Error deleting record:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="w-full overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <table className="w-full min-w-max table-auto text-left">
          <thead className="border-b border-gray-100 dark:border-white/[0.05] bg-gray-50/50 dark:bg-white/[0.01]">
            {/* 1. Standard Header Row */}
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 whitespace-nowrap"
                >
                  {column.header}
                </th>
              ))}
            </tr>

            {/* 2. Filter Input Row (Conditionally Rendered) */}
            {showFilters && (
              <tr className="bg-gray-50 border-t border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                {columns.map((column, index) => {
                  // Determine the key to use for filtering (accessor or accessorKey)
                  const filterKey = column.accessor || column.accessorKey;

                  return (
                    <th key={`filter-${index}`} className="px-4 py-2">
                      {/* Only render input if there is a data key (skips Action columns) */}
                      {filterKey ? (
                        <input
                          type="text"
                          placeholder={column.header}
                          value={filters?.[filterKey] || ""}
                          onChange={(e) =>
                            onFilterChange && onFilterChange(filterKey, e.target.value)
                          }
                          className="w-full rounded border-[1.5px] border-gray-200 bg-white px-3 py-1.5 text-sm font-normal text-gray-700 outline-none transition focus:border-brand-500 active:border-brand-500 disabled:cursor-default disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-brand-500"
                        />
                      ) : (
                        // Spacer for columns without filtering (like Actions)
                        <div className="h-9"></div>
                      )}
                    </th>
                  );
                })}
              </tr>
            )}
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {data && data.length > 0 ? (
              data.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors">
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className="px-5 py-4 text-theme-sm dark:text-gray-400 whitespace-nowrap"
                    >
                      {column.render ? (
                        column.render(row)
                      ) : (
                        <span className="text-gray-900 dark:text-white">
                          {/* Safe access to nested properties could be added here if needed */}
                          {row[column.accessor] !== undefined
                            ? row[column.accessor]
                            : row[column.accessorKey]}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-5 py-10 text-center text-gray-500"
                >
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        showCloseButton={true}
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Confirm Delete
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Are you sure you want to delete this record? This action cannot be
            undone.
          </p>
          <div className="flex justify-end gap-4">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50"
            >
              {isLoading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

// Helper function to create action column
export const createActionColumn = (onView, onEdit, onDelete) => ({
  header: "Actions",
  // No 'accessor' means no filter input will be rendered for this column
  render: (row) => (
    <div className="flex items-center gap-3">
      {onView && (
        <button
          onClick={() => onView(row)}
          className="text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400 transition-colors"
          title="View"
        >
          <Eye className="w-4 h-4" />
        </button>
      )}

      {onEdit && (
        <button
          onClick={() => onEdit(row)}
          className="text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400 transition-colors"
          title="Edit"
        >
          <Pencil className="w-4 h-4" />
        </button>
      )}

      {onDelete && (
        <button
          onClick={() => onDelete(row)}
          className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  ),
});