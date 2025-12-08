#!/usr/bin/env node

/**
 * Pagination & Search Setup Guide for Additional Resource Pages
 *
 * This file provides copy-paste templates for adding pagination and search
 * to other resource pages in the BMI Portal.
 *
 * Each template assumes:
 * 1. The resource API is already updated in services/api.js
 * 2. You're creating/updating a View component (e.g., CustomersView.jsx)
 */

// ============================================================================
// TEMPLATE 1: CUSTOMERS VIEW
// File: src/pages/customers/CustomerView.jsx (or update View.jsx)
// ============================================================================

const CUSTOMER_VIEW_TEMPLATE = `
import { Eye, Pencil, Trash } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../../components/ui/table/Table";
import { Pagination } from "../../components/common/Pagination";
import { SearchBar } from "../../components/common/SearchBar";
import Loader from "../../components/common/Loader";
import { listResource, customersAPI } from "../../services/api";

const CustomerView = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
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

  // Load paginated customers
  useEffect(() => {
    loadCustomers();
  }, [currentPage, debouncedSearch]);

  const loadCustomers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await customersAPI.list({
        page: currentPage,
        perPage: 25,
        search: debouncedSearch,
      });

      setCustomers(response.rows || []);
      setPaginationInfo({
        total: response.total || 0,
        perPage: response.perPage || 25,
        lastPage: response.lastPage || 1,
      });
    } catch (err) {
      console.error("Error loading customers:", err);
      setError(err.message);
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      try {
        await customersAPI.delete(id);
        loadCustomers();
      } catch (err) {
        console.error("Error deleting customer:", err);
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
      render: (customer) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {customer.name}
        </span>
      ),
    },
    { header: "Email", accessorKey: "email" },
    { header: "Phone", accessorKey: "phone", render: (c) => c.phone || "—" },
    { header: "Address", accessorKey: "address", render: (c) => c.address || "—" },
    {
      header: "Created At",
      accessorKey: "created_at",
      render: (customer) => {
        if (!customer.created_at) return "—";
        return new Date(customer.created_at).toLocaleDateString();
      },
    },
    {
      header: "Actions",
      render: (customer) => (
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(\`/customers/show/\${customer.id}\`)}
            className="text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
            title="View"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate(\`/customers/edit/\${customer.id}\`)}
            className="text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(customer.id)}
            className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
            title="Delete"
          >
            <Trash className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  if (error && customers.length === 0) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-300">
            Error: {error}
          </p>
          <button
            onClick={() => loadCustomers()}
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
          Customers
        </h2>
        <button
          onClick={() => navigate("/customers?tab=add")}
          className="inline-flex items-center justify-center rounded-md bg-brand-500 px-4 py-2 text-center font-medium text-white hover:bg-opacity-90 lg:px-6 xl:px-8"
        >
          Add New Customer
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search customers by name or email..."
          isLoading={isLoading}
          debounceDelay={500}
        />
      </div>

      {/* Table */}
      <div className="flex flex-col gap-6">
        {isLoading && customers.length === 0 ? (
          <Loader />
        ) : customers.length > 0 ? (
          <>
            <Table columns={columns} data={customers} />

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
                ? "No customers found for your search."
                : "No customers available."}
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

export default CustomerView;
`;

// ============================================================================
// TEMPLATE 2: INVOICES VIEW
// File: src/pages/invoices/InvoiceView.jsx (or similar)
// ============================================================================

const INVOICES_VIEW_TEMPLATE = `
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../../components/ui/table/Table";
import { Pagination } from "../../components/common/Pagination";
import { SearchBar } from "../../components/common/SearchBar";
import Loader from "../../components/common/Loader";
import { Eye, Pencil, Trash, Download } from "lucide-react";
import { listResource, invoicesAPI } from "../../services/api";

const InvoiceView = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    loadInvoices();
  }, [currentPage, debouncedSearch]);

  const loadInvoices = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await invoicesAPI.list({
        page: currentPage,
        perPage: 25,
        search: debouncedSearch,
      });

      setInvoices(response.rows || []);
      setPaginationInfo({
        total: response.total || 0,
        perPage: response.perPage || 25,
        lastPage: response.lastPage || 1,
      });
    } catch (err) {
      console.error("Error loading invoices:", err);
      setError(err.message);
      setInvoices([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (id) => {
    try {
      await invoicesAPI.download(id);
    } catch (err) {
      console.error("Error downloading invoice:", err);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      try {
        await invoicesAPI.delete(id);
        loadInvoices();
      } catch (err) {
        console.error("Error deleting invoice:", err);
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
    { header: "Invoice ID", accessorKey: "invoice_id" },
    { header: "Customer No", accessorKey: "customer_no" },
    { header: "Amount", accessorKey: "amount", render: (inv) => \`\$\${inv.amount}\` },
    { header: "Date", accessorKey: "date", render: (inv) => new Date(inv.date).toLocaleDateString() },
    {
      header: "Actions",
      render: (invoice) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(\`/invoices/show/\${invoice.id}\`)}
            className="text-gray-500 hover:text-brand-500"
            title="View"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDownload(invoice.id)}
            className="text-gray-500 hover:text-brand-500"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate(\`/invoices/edit/\${invoice.id}\`)}
            className="text-gray-500 hover:text-brand-500"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(invoice.id)}
            className="text-gray-500 hover:text-red-500"
            title="Delete"
          >
            <Trash className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-bold text-black dark:text-white">
          Invoices
        </h2>
        <button
          onClick={() => navigate("/invoices?tab=add")}
          className="inline-flex items-center justify-center rounded-md bg-brand-500 px-4 py-2 text-center font-medium text-white hover:bg-opacity-90 lg:px-6 xl:px-8"
        >
          Add New Invoice
        </button>
      </div>

      <div className="mb-6">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search invoices..."
          isLoading={isLoading}
        />
      </div>

      <div className="flex flex-col gap-6">
        {isLoading && invoices.length === 0 ? (
          <Loader />
        ) : invoices.length > 0 ? (
          <>
            <Table columns={columns} data={invoices} />
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
              {debouncedSearch ? "No invoices found." : "No invoices available."}
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

export default InvoiceView;
`;

// ============================================================================
// QUICK REFERENCE
// ============================================================================

const QUICK_REFERENCE = {
  components: {
    Pagination: "src/components/common/Pagination.jsx",
    SearchBar: "src/components/common/SearchBar.jsx",
  },
  imports: [
    'import { Pagination } from "../../components/common/Pagination";',
    'import { SearchBar } from "../../components/common/SearchBar";',
    'import Loader from "../../components/common/Loader";',
    'import { listResource } from "../../services/api";',
  ],
  necessaryHooks: [
    "useState - for managing state",
    "useEffect - for side effects",
    "useCallback - for memoized callbacks",
    "useNavigate (from react-router-dom) - for navigation",
  ],
  stateVariables: {
    data: "useState([])",
    isLoading: "useState(true)",
    error: "useState(null)",
    currentPage: "useState(1)",
    searchQuery: "useState('')",
    debouncedSearch: "useState('')",
    paginationInfo: "useState({ total: 0, perPage: 25, lastPage: 1 })",
  },
  patterns: {
    debounceSearch: "useEffect with setTimeout in searchQuery dependency",
    loadData: "useEffect triggered by currentPage and debouncedSearch",
    handleCallbacks: "useCallback for search and page change handlers",
  },
};

console.log("=".repeat(80));
console.log("PAGINATION & SEARCH SETUP TEMPLATES");
console.log("=".repeat(80));
console.log("\n");
console.log("RESOURCES TO UPDATE:");
console.log("- Customers");
console.log("- Invoices");
console.log("- Debit Notes");
console.log("- Credit Notes");
console.log("- Account Statements");
console.log("- Delivery Orders");
console.log("- Payment Records");
console.log("\n");
console.log("COMPONENTS CREATED:");
console.log("- Pagination.jsx");
console.log("- SearchBar.jsx");
console.log("\n");
console.log("See PAGINATION_SEARCH_GUIDE.md for full documentation.");
console.log("=".repeat(80));

module.exports = {
  CUSTOMER_VIEW_TEMPLATE,
  INVOICES_VIEW_TEMPLATE,
  QUICK_REFERENCE,
};
