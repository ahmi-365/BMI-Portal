import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertTriangle, // Icon for the warning modal
} from "lucide-react";
import { DataTable, createActionColumn } from "./DataTable";
import {
  listResource,
  userListResource,
  deleteResource,
  paymentsAPI,
} from "../../services/api";
import Loader from "./Loader";
import PageBreadcrumb from "./PageBreadCrumb";
import Toast from "./Toast";

// --- Internal Delete Confirmation Modal Component ---
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, isLoading }) => {
  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-lg"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800 animate-fadeIn">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-red-100 p-3 dark:bg-red-900/30">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-500" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
            Delete Record?
          </h3>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            Are you sure you want to delete this record? This action cannot be
            undone.
          </p>
          <div className="flex w-full gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? "Deleting..." : "Yes, Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Render modal in portal to ensure it's above all other content
  const modalRoot = document.getElementById("modal-root");
  return modalRoot ? createPortal(modalContent, modalRoot) : null;
};

// --- Main List Page Component ---
export const ListPage = ({
  resourceName,
  columns: baseColumns,
  title = "List",
  subtitle = "Manage your records",
  perPage = 25,
  basePath,
  showEdit = true,
  showDelete = true,
  showActions = true,
  selectedIds = [],
  onSelectionChange,
  headerAction,
  refreshKey = 0,
  additionalParams = {},
  initialFilters = null,
}) => {
  const navigate = useNavigate();

  // Data State
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination State
  const [perPageState, setPerPageState] = useState(perPage);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [tempFilters, setTempFilters] = useState(initialFilters || {});
  const [filters, setFilters] = useState(initialFilters || {});
  const [showFilters, setShowFilters] = useState(false);

  // Sync filters when parent provides a new initial set
  useEffect(() => {
    if (initialFilters) {
      setFilters(initialFilters);
      setTempFilters(initialFilters);
    }
  }, [initialFilters]);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Load Data Function
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {
        page: currentPage,
        perPage: perPageState,
        search: appliedSearch,
        ...filters,
        ...additionalParams,
      };

      const isUserResource = resourceName.startsWith("user/");
      const result = isUserResource
        ? await userListResource(resourceName, params)
        : await listResource(resourceName, params);

      setData(result.rows || []);
      setTotalPages(result.lastPage || 1);
      setTotal(result.total || 0);
    } catch (error) {
      console.error("Error loading data:", error);
      setData([]);
      setTotalPages(1);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [
    resourceName,
    currentPage,
    perPageState,
    appliedSearch,
    filters,
    refreshKey,
  ]);

  // Trigger Load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle search with Enter key
  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      setAppliedSearch(searchQuery);
      setCurrentPage(1);
    }
  };

  // Handle filter change (temporary, not applied yet)
  const handleFilterChange = (key, value) => {
    setTempFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Apply filters
  const handleApplyFilters = () => {
    setFilters(tempFilters);
    setCurrentPage(1);
  };

  // Clear filters
  const handleClearFilters = () => {
    setTempFilters({});
    setFilters({});
    setSearchQuery("");
    setAppliedSearch("");
    setCurrentPage(1);
    setShowFilters(false);
  };

  const resolvedBase = basePath || `/${resourceName}`;
  const handleView = (row) => {
    // Use the user-specific route if basePath indicates user resource
    const route =
      basePath ||
      (resourceName.startsWith("user/")
        ? `/${resourceName}`
        : `/${resourceName}`);
    navigate(`${route}/show/${row.id}`);
  };
  const handleEdit = (row) => navigate(`${resolvedBase}/edit/${row.id}`);

  // --- Delete Handlers ---
  const promptDelete = (row) => {
    setItemToDelete(row);
    setIsDeleteModalOpen(true);
    setDeleteError("");
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      setIsDeleting(true);
      // Call your API
      if (resourceName.startsWith("payments/")) {
        await paymentsAPI.delete(itemToDelete.id);
      } else {
        await deleteResource(resourceName, itemToDelete.id);
      }

      // Close modal and refresh
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      setDeleteError("");
      await loadData();
    } catch (error) {
      console.error("Delete failed", error);
      setDeleteError(error?.message || "Failed to delete record");
      // Close modal on error as well
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = showActions
    ? [
        ...baseColumns,
        // Pass promptDelete instead of direct delete. Make edit handler optional via `showEdit` prop.
        createActionColumn(
          handleView,
          showEdit ? handleEdit : null,
          showDelete ? promptDelete : null
        ),
      ]
    : baseColumns;

  // Pagination Helper
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) rangeWithDots.push(l + 1);
        else if (i - l !== 1) rangeWithDots.push("...");
      }
      rangeWithDots.push(i);
      l = i;
    });
    return rangeWithDots;
  };

  const pageNumbers = getPageNumbers();
  const startIndex = (currentPage - 1) * perPageState + 1;
  const endIndex = Math.min(currentPage * perPageState, total);

  return (
    <div className="p-6 animate-fade-in-up">
      {deleteError && (
        <Toast
          message={deleteError}
          type="error"
          onClose={() => setDeleteError("")}
        />
      )}{" "}
      {/* Breadcrumb Navigation */}
      <PageBreadcrumb pageTitle={title} breadcrumbs={[{ label: title }]} />
      {/* Header with Subtitle */}
      {subtitle && (
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {subtitle}
            </p>
          </div>
          <div className="flex gap-2">{headerAction}</div>
        </div>
      )}
      {/* Apply/Clear Filters Buttons + Search + Filter Toggle (Inline) */}
      <div className="mb-4 gap-3 flex justify-end flex-wrap">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${title.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            disabled={isLoading}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-center font-medium border transition-colors ${
            showFilters
              ? "bg-brand-500 border-brand-500 text-white"
              : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700"
          }`}
        >
          <Filter className="w-5 h-5" />
          {showFilters ? "Hide Filters" : "Filter"}
        </button>{" "}
        {showFilters && (
          <>
            <button
              onClick={handleApplyFilters}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 border border-brand-500 px-4 py-2 text-center font-medium text-white hover:bg-brand-600 transition-colors disabled:opacity-50"
            >
              Apply
            </button>
            <button
              onClick={handleClearFilters}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white border border-gray-300 px-4 py-2 text-center font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Clear
            </button>
          </>
        )}
      </div>
      {isLoading && data.length === 0 ? (
        <div className="flex justify-center items-center h-96">
          <Loader />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] overflow-hidden card-hover animate-slide-up">
            <DataTable
              columns={columns}
              data={data}
              resourceName={resourceName}
              onRefresh={loadData}
              showFilters={showFilters}
              filters={tempFilters}
              onFilterChange={handleFilterChange}
              onApplyFilters={handleApplyFilters}
              selectedIds={selectedIds}
              onSelectionChange={onSelectionChange}
            />
          </div>

          {/* Bottom Bar: Pagination & Info */}
          {/* Changed Condition: Show this bar if we have ANY data (total > 0), regardless of page count */}
          {total > 0 && (
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
              {/* Left Side: Info & Dropdown */}
              <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-start">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing <span className="font-medium">{startIndex}</span> to{" "}
                  <span className="font-medium">{endIndex}</span> of{" "}
                  <span className="font-medium">{total}</span> results
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600 dark:text-gray-400">
                    Per page:
                  </label>
                  <select
                    value={perPageState}
                    onChange={(e) => {
                      setPerPageState(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>

              {/* Right Side: Next/Prev Buttons (Only show if multiple pages) */}
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1 || isLoading}
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Previous</span>
                  </button>

                  <div className="hidden items-center gap-1 sm:flex">
                    {pageNumbers.map((page, index) => {
                      if (page === "...") {
                        return (
                          <span
                            key={`ellipsis-${index}`}
                            className="px-2 py-2 text-gray-600 dark:text-gray-400"
                          >
                            ...
                          </span>
                        );
                      }
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          disabled={isLoading}
                          className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                            page === currentPage
                              ? "bg-brand-500 text-white"
                              : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages || isLoading}
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
      {/* Render the Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
          setDeleteError("");
        }}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};
