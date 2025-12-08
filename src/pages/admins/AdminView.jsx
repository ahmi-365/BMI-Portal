import { Eye, Pencil, Trash } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../../components/ui/table/Table";
import { Pagination } from "../../components/common/Pagination";
import { SearchBar } from "../../components/common/SearchBar";
import Loader from "../../components/common/Loader";
import { listResource, adminUsersAPI } from "../../services/api";

const AdminView = () => {
  const navigate = useNavigate();
  const [adminUsers, setAdminUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [paginationInfo, setPaginationInfo] = useState({
    total: 0,
    perPage: 25,
    lastPage: 1,
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load paginated admin users
  useEffect(() => {
    loadAdminUsers();
  }, [currentPage, debouncedSearch]);

  const loadAdminUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await listResource("admins", {
        page: currentPage,
        perPage: 25,
        search: debouncedSearch,
      });

      setAdminUsers(response.rows || []);
      setPaginationInfo({
        total: response.total || 0,
        perPage: response.perPage || 25,
        lastPage: response.lastPage || 1,
      });
    } catch (err) {
      console.error("Error loading admin users:", err);
      setError(err.message);
      setAdminUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this admin?")) {
      try {
        await adminUsersAPI.delete(id);
        // Reload data
        loadAdminUsers();
      } catch (err) {
        console.error("Error deleting admin:", err);
        setError(err.message);
      }
    }
  };

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const columns = [
    {
      header: "Name",
      accessorKey: "name",
      render: (user) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {user.name}
        </span>
      ),
    },
    {
      header: "Email",
      accessorKey: "email",
    },
    {
      header: "Phone",
      accessorKey: "phone",
      render: (user) => user.phone || "—",
    },
    {
      header: "Created At",
      accessorKey: "created_at",
      render: (user) => {
        if (!user.created_at) return "—";
        return new Date(user.created_at).toLocaleDateString();
      },
    },
    {
      header: "Actions",
      render: (user) => (
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/admins/show/${user.id}`)}
            className="text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400 transition-colors"
            title="View"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate(`/admins/edit/${user.id}`)}
            className="text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400 transition-colors"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(user.id)}
            className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
            title="Delete"
          >
            <Trash className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  if (error && adminUsers.length === 0) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-300">
            Error: {error}
          </p>
          <button
            onClick={() => loadAdminUsers()}
            className="mt-3 inline-flex items-center justify-center rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-bold text-black dark:text-white">
          Admin Users
        </h2>
        <button
          onClick={() => navigate("/admin-users/add")}
          className="inline-flex items-center justify-center rounded-md bg-brand-500 px-4 py-2 text-center font-medium text-white hover:bg-opacity-90 lg:px-6 xl:px-8"
        >
          Add New Admin
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search admins by name or email..."
          isLoading={isLoading}
          debounceDelay={500}
        />
      </div>

      {/* Table */}
      <div className="flex flex-col gap-6">
        {isLoading && adminUsers.length === 0 ? (
          <Loader />
        ) : adminUsers.length > 0 ? (
          <>
            <Table columns={columns} data={adminUsers} />

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={paginationInfo.lastPage}
              total={paginationInfo.total}
              perPage={paginationInfo.perPage}
              onPageChange={handlePageChange}
              isLoading={isLoading}
            />
          </>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
            <p className="text-gray-500 dark:text-gray-400">
              {debouncedSearch
                ? "No admins found for your search."
                : "No admin users available."}
            </p>
            {debouncedSearch && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-4 inline-flex items-center justify-center rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminView;
