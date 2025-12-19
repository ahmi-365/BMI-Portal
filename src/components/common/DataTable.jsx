import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Modal } from "../ui/modal"; // Ensure this path is correct for your project
import { deleteResource, paymentsAPI } from "../../services/api";
import { DateRangePicker } from "./DateRangePicker";

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
  onApplyFilters,
  // New props for selection
  selectedIds = [],
  onSelectionChange,
}) => {
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectAll = () => {
    if (selectedIds.length === data.length) {
      onSelectionChange?.([]);
    } else {
      onSelectionChange?.(data.map((row) => row.id));
    }
  };

  const handleSelectRow = (id) => {
    if (selectedIds.includes(id)) {
      onSelectionChange?.(selectedIds.filter((sid) => sid !== id));
    } else {
      onSelectionChange?.([...selectedIds, id]);
    }
  };

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
      if (resourceName.startsWith("payments/")) {
        await paymentsAPI.delete(selectedRow.id);
      } else {
        await deleteResource(resourceName, selectedRow.id);
      }
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
      <div className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 shadow-lg hover:shadow-xl transition-shadow duration-300 animate-fadeIn">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-max table-auto text-left border-separate border-spacing-0">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800 dark:to-gray-800/50 sticky top-0 z-10">
              {/* 1. Standard Header Row */}
              <tr>
                {onSelectionChange && (
                  <th className="px-5 py-4 font-semibold text-gray-700 text-xs uppercase tracking-wider dark:text-gray-300 whitespace-nowrap first:rounded-tl-2xl border-b-2 border-gray-200 dark:border-gray-700 w-12">
                    <input
                      type="checkbox"
                      checked={
                        data.length > 0 && selectedIds.length === data.length
                      }
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-brand-600 rounded"
                    />
                  </th>
                )}
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className="px-5 py-4 font-semibold text-gray-700 text-xs uppercase tracking-wider dark:text-gray-300 whitespace-nowrap first:rounded-tl-2xl last:rounded-tr-2xl border-b-2 border-gray-200 dark:border-gray-700"
                  >
                    {column.header}
                  </th>
                ))}
              </tr>

              {/* 2. Filter Input Row (Conditionally Rendered) */}
              {showFilters && (
                <tr className="bg-gray-50/80 dark:bg-gray-800/50 backdrop-blur-sm">
                  {onSelectionChange && <th className="px-4 py-2"></th>}
                  {columns.map((column, index) => {
                    const filterKey =
                      column.filterKey || column.accessor || column.accessorKey;
                    const filterType = column.filterType || "text";
                    const allowFilter =
                      filterKey &&
                      column.showFilter !== false &&
                      column.disableFilter !== true;

                    const renderFilterControl = () => {
                      if (filterType === "date-range") {
                        const fromKey = `${filterKey}_from`;
                        const toKey = `${filterKey}_to`;

                        return (
                          <DateRangePicker
                            dateFrom={filters?.[fromKey] || ""}
                            dateTo={filters?.[toKey] || ""}
                            onDateChange={(type, value) => {
                              if (type === "from") {
                                onFilterChange &&
                                  onFilterChange(fromKey, value);
                              } else if (type === "to") {
                                onFilterChange && onFilterChange(toKey, value);
                              } else if (type === "clear") {
                                onFilterChange && onFilterChange(fromKey, "");
                                onFilterChange && onFilterChange(toKey, "");
                              }
                              // Auto-apply on date selection
                              if (onApplyFilters) {
                                setTimeout(() => onApplyFilters(), 100);
                              }
                            }}
                          />
                        );
                      }

                      return (
                        <input
                          type={filterType}
                          placeholder={
                            filterType === "date" ? "" : column.header
                          }
                          value={filters?.[filterKey] || ""}
                          onChange={(e) =>
                            onFilterChange &&
                            onFilterChange(filterKey, e.target.value)
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && onApplyFilters) {
                              onApplyFilters();
                            }
                          }}
                          className="w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-sm font-normal text-gray-700 outline-none transition-all duration-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 active:border-brand-500 disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-900/30 hover:border-gray-300 dark:hover:border-gray-500"
                        />
                      );
                    };

                    return (
                      <th key={`filter-${index}`} className="px-4 py-2">
                        {allowFilter ? (
                          <div className="w-full">{renderFilterControl()}</div>
                        ) : (
                          <div className="h-9"></div>
                        )}
                      </th>
                    );
                  })}
                </tr>
              )}
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {data && data.length > 0 ? (
                data.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => handleView(row)}
                    className={`group transition-all duration-200 cursor-pointer ${
                      selectedIds.includes(row.id)
                        ? "bg-brand-50 dark:bg-brand-900/20"
                        : "hover:bg-gradient-to-r hover:from-brand-50/30 hover:to-transparent dark:hover:from-brand-900/10 dark:hover:to-transparent"
                    }`}
                  >
                    {onSelectionChange && (
                      <td
                        className="px-5 py-4 w-12"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectRow(row.id);
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(row.id)}
                          onChange={() => handleSelectRow(row.id)}
                          className="w-4 h-4 text-brand-600 rounded cursor-pointer"
                        />
                      </td>
                    )}
                    {columns.map((column, colIndex) => (
                      <td
                        key={colIndex}
                        onClick={(e) => {
                          // Prevent row click when clicking action buttons or interactive elements
                          if (
                            column.header === "Actions" ||
                            e.target.tagName === "BUTTON" ||
                            e.target.tagName === "A"
                          ) {
                            e.stopPropagation();
                          }
                        }}
                        className="px-5 py-4 text-sm dark:text-gray-400 whitespace-nowrap group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-200"
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
                    className="px-5 py-16 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-3">
                      <svg
                        className="w-16 h-16 text-gray-300 dark:text-gray-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                      </svg>
                      <p className="text-gray-500 dark:text-gray-400 font-medium">
                        No data available
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
    <div className="flex items-center gap-2">
      {onEdit && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(row);
          }}
          className="group/btn relative inline-flex items-center justify-center rounded-lg bg-brand-50 px-3 py-2 text-brand-700 transition-all duration-200 hover:bg-brand-100 hover:shadow-md hover:-translate-y-0.5 dark:bg-brand-900/30 dark:text-brand-200 dark:hover:bg-brand-900/50"
          title="Edit"
        >
          <Pencil className="w-4 h-4 transition-transform duration-200 group-hover/btn:scale-110" />
        </button>
      )}

      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(row);
          }}
          className="group/btn relative inline-flex items-center justify-center rounded-lg bg-red-50 px-3 py-2 text-red-600 transition-all duration-200 hover:bg-red-100 hover:shadow-md hover:-translate-y-0.5 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
          title="Delete"
        >
          <Trash2 className="w-4 h-4 transition-transform duration-200 group-hover/btn:scale-110" />
        </button>
      )}
    </div>
  ),
});
