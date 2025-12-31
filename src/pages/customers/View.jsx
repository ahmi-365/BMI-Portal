import { useState } from "react";
import { ListPage } from "../../components/common/ListPage";
import PageMeta from "../../components/common/PageMeta";
import { customersAPI } from "../../services/api";
import { toast } from "react-toastify";

const APPROVED_COLUMNS = [
  {
    header: "Customer No.",
    accessor: "customer_no",
    filterKey: "customer_no",
    render: (row) => row.customer_no || row.customerNo || "-",
  },
  {
    header: "Company",
    accessor: "company",
    filterKey: "company",
    render: (row) => row.company || "-",
  },
  {
    header: "Name",
    accessor: "name",
    filterKey: "name",
    render: (row) => row.name || "-",
  },
  {
    header: "Email",
    accessor: "email",
    filterKey: "email",
    render: (row) => row.email || "-",
  },
  {
    header: "Payment Term",
    accessor: "payment_term",
    filterKey: "payment_term",
    render: (row) => row.payment_term ?? row.paymentTerm ?? "-",
  },
  {
    header: "Status",
    accessor: "form_status",
    filterKey: "form_status",
    render: (row) => (row.form_status === 2 ? "Inactive" : "Active"),
    disableFilter: true,
  },
  {
    header: "Created At",
    accessor: "created_at",
    filterKey: "uploaded",
    filterType: "date-range",
    render: (row) =>
      row.created_at || row.createdAt
        ? (row.created_at || row.createdAt).split("T")[0]
        : "-",
  },
  {
    header: "Added By", 
    accessor: "uploaded_by",
    filterKey: "uploaded_by",   
    render: (row) => row.admin?.name || "-", 
  },
];
  
const PENDING_COLUMNS = [
  {
    header: "Business Contact Name",
    accessor: "name",
    filterKey: "name",
    render: (row) => row.name || "-",
  },
  {
    header: "Customer No.", 
    accessor: "customer_no",
    filterKey: "customer_no",
    render: (row) => row.customer_no || "-",
  },
  {
    header: "Company/Business Name",
    accessor: "company",
    filterKey: "company",
    render: (row) => row.company || "-",
  },
  {
    header: "Status",
    accessor: "form_status",
    filterKey: "form_status",
    disableFilter: true,
    render: (row) => (row.form_status === 2 ? "Inactive" : "Active"),
  },
  // {
  //   header: "Business Contact Number",
  //   accessor: "phone",
  //   render: (row) => row.phone || "-",
  // },
  {
    header: "Created At",
    accessor: "created_at",
    filterKey: "uploaded",
    filterType: "date-range",
    render: (row) =>
      row.created_at || row.createdAt
        ? (row.created_at || row.createdAt).split("T")[0]
        : "-",
  },
  {
    header: "Approve",
    accessor: "id",
    disableFilter: true,
    render: (row) => (
      <div className="flex items-center gap-2">
        {/* Approve Button */}
        <button
          onClick={async (e) => {
            e.stopPropagation();
            try {
              await customersAPI.approve(row.id);
              toast.success("Customer approved successfully");
              window.location.reload();
            } catch (error) {
              toast.error("Failed to approve customer");
              console.error(error);
            }
          }}
          className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
          title="Approve Customer"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </button>
      </div>
    ),
  },
];

export default function CustomersView() {
  const [activeTab, setActiveTab] = useState("approved");

  return (
    <div>
      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex -mb-px space-x-6" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("approved")}
            className={`pb-3 text-sm font-medium ${
              activeTab === "approved"
                ? "border-b-2 border-brand-500 text-brand-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`pb-3 text-sm font-medium ${
              activeTab === "pending"
                ? "border-b-2 border-brand-500 text-brand-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Pending
          </button>
        </nav>
      </div>

      <div>
        {activeTab === "approved" && (
          <ListPage
            resourceName="approved-customers"
            columns={APPROVED_COLUMNS}
            title="Approved Customers"
            subtitle="View and manage all approved customers"
            basePath="/customers"
          />
        )}

        {activeTab === "pending" && (
          <ListPage
            resourceName="pending-customers"
            columns={PENDING_COLUMNS}
            title="Pending Customers"
            subtitle="Review and manage pending customer approvals"
            basePath="/customers"
          />
        )}

        {activeTab === "add" && (
          <div className="mt-4">
            {/* Lazy-load the Add form component to avoid bundling issues */}
            <ListPage
              resourceName="pending-customers"
              columns={PENDING_COLUMNS}
              title="Pending Customers"
              basePath="/customers"
              style={{ display: "none" }}
            />
            {/* Render the Add form inline */}
            {/* Importing Add component directly to render */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
              {/* Keep markup minimal — the Add page provides the ResourceForm */}
              <h3 className="text-lg font-semibold mb-4">Add Customer</h3>
              {/* Embed the Add form component */}
              {/* We import dynamically to avoid circular dependency; using require here is fine in Vite dev */}
              {(() => {
                try {
                  const Add = require("./Add").default;
                  return <Add />;
                } catch (e) {
                  // Fallback: show link to add route
                  return (
                    <div>
                      <p className="text-sm text-gray-500">
                        Unable to render add form inline.
                      </p>
                      <a
                        href="/customers/add"
                        className="text-brand-500 hover:underline"
                      >
                        Open Add Customer page
                      </a>
                    </div>
                  );
                }
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
