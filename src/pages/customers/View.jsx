import { useState } from "react";
import { ListPage } from "../../components/common/ListPage";
import PageMeta from "../../components/common/PageMeta";

const APPROVED_COLUMNS = [
  {
    header: "Customer No.",
    accessor: "customer_no",
    render: (row) => row.customer_no || row.customerNo || "-",
  },
  {
    header: "Company",
    accessor: "company",
    render: (row) => row.company || "-",
  },
  { header: "Name", accessor: "name", render: (row) => row.name || "-" },
  { header: "Email", accessor: "email", render: (row) => row.email || "-" },
  {
    header: "Payment Term",
    accessor: "payment_term",
    render: (row) => row.payment_term ?? row.paymentTerm ?? "-",
  },
  { header: "Status", accessor: "status", render: (row) => row.status ?? "-" },
  {
    header: "Created At",
    accessor: "created_at",
    render: (row) => row.created_at || row.createdAt || "-",
  },
  {
    header: "Added By",
    accessor: "admin_id",
    render: (row) => row.admin_id || "-",
  },
];

const PENDING_COLUMNS = [
  {
    header: "Business Contact Name",
    accessor: "name",
    render: (row) => row.name || "-",
  },
  {
    header: "Customer No.",
    accessor: "customer_no",
    render: (row) => row.customer_no || "-",
  },
  {
    header: "Company/Business Name",
    accessor: "company",
    render: (row) => row.company || "-",
  },
  { header: "Status", accessor: "status", render: (row) => row.status ?? "-" },
  {
    header: "Business Contact Number",
    accessor: "phone",
    render: (row) => row.phone || "-",
  },
  {
    header: "Created At",
    accessor: "created_at",
    render: (row) => row.created_at || "-",
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
            basePath="/customers"
          />
        )}

        {activeTab === "pending" && (
          <ListPage
            resourceName="pending-customers"
            columns={PENDING_COLUMNS}
            title="Pending Customers"
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
