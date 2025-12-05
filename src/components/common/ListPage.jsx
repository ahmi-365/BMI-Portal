import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Filter, X } from "lucide-react";
import { DataTable, createActionColumn } from "./DataTable";
import { getMockData, searchData } from "../../services/api";
import Loader from "./Loader";

export const ListPage = ({
  resourceName,
  columns: baseColumns,
  title = "List",
  subtitle = "Manage your records",
}) => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Global Search State
  const [searchQuery, setSearchQuery] = useState("");
  
  // Column Filter State
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterData();
  }, [data, searchQuery, filters]);

  const loadData = async () => {
    try {
      const result = await getMockData(resourceName);
      setData(Array.isArray(result) ? result : []);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error loading data:", error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterData = async () => {
    let initialResults = [];

    // 1. Global Search
    if (!searchQuery.trim()) {
      initialResults = data;
    } else {
      try {
        const results = await searchData(resourceName, searchQuery);
        initialResults = Array.isArray(results) ? results : [];
      } catch (error) {
        initialResults = data;
      }
    }

    // 2. Column Specific Filters
    const finalResults = initialResults.filter((row) => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        const rowValue = row[key];
        if (rowValue === undefined || rowValue === null) return false;
        return String(rowValue).toLowerCase().includes(value.toLowerCase());
      });
    });

    setFilteredData(finalResults);
    setCurrentPage(1); 
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery("");
  };

  const handleView = (row) => {
    navigate(`/${resourceName}/show/${row.id}`);
  };

  const handleEdit = (row) => {
    navigate(`/${resourceName}/edit/${row.id}`);
  };

  const handleDelete = (row) => {
    console.log("Delete", row);
  };

  const columns = [
    ...baseColumns,
    createActionColumn(handleView, handleEdit, handleDelete),
  ];

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-title-md2 font-bold text-black dark:text-white">
            {title}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
        </div>
        <div className="flex gap-2">
           {/* Toggle Button */}
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
          </button>

          <button
            onClick={() => navigate(`/${resourceName}/add`)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-6 py-2.5 text-center font-medium text-white hover:bg-brand-600"
          >
            <Plus className="w-5 h-5" />
            Add New
          </button>
        </div>
      </div>

      {/* Global Search (Optional, if you want it separate from the table) */}
      <div className="mb-4 flex justify-end">
         <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Global Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-96">
          <Loader />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] overflow-hidden">
            <DataTable
              columns={columns}
              data={paginatedData}
              resourceName={resourceName}
              onRefresh={loadData}
              // NEW PROPS FOR FILTER ROW
              showFilters={showFilters}
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </div>

          {/* Pagination */}
          {totalPages > 0 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {startIndex + 1} to{" "}
                {Math.min(startIndex + pageSize, filteredData.length)} of{" "}
                {filteredData.length} results
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};