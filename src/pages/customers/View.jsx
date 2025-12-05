import { useState } from "react";
import { ListPage } from "../../components/common/ListPage";
import PageMeta from "../../components/common/PageMeta";

const APPROVED_COLUMNS = [
  { header: "Customer No.", accessor: "customerNo" },
  { header: "Company", accessor: "company" },
  { header: "Name", accessor: "name" },
  { header: "Email", accessor: "email" },
  { header: "Payment Term", accessor: "paymentTerm" },
  { header: "Status", accessor: "status" },
  { header: "Created At", accessor: "createdAt" },
  { header: "Added By", accessor: "addedBy" },
];

const PENDING_COLUMNS = [
  { header: "Business Contact Name", accessor: "businessContactName" },
  { header: "Customer No.", accessor: "customerNo" },
  { header: "Company/Business Name", accessor: "company" },
  { header: "Status", accessor: "status" },
  { header: "Business Contact Number", accessor: "businessContactNumber" },
  { header: "Created At", accessor: "createdAt" },
];

export default function CustomersView() {
  const [activeTab, setActiveTab] = useState("approved");

  return (
    <div>
      <div className="border-b border-gray-200 dark:border-gray-700 px-6 pt-4">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("approved")}
            className={`pb-3 px-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "approved"
                ? "border-brand-500 text-brand-500"
                : "border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400"
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`pb-3 px-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "pending"
                ? "border-brand-500 text-brand-500"
                : "border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400"
            }`}
          >
            Pending
          </button>
        </div>
      </div>

      {activeTab === "approved" && (
        <ListPage
          resourceName="customers-approved"
          columns={APPROVED_COLUMNS}
          title="Approved Customers"
        />
      )}

      {activeTab === "pending" && (
        <ListPage
          resourceName="customers-pending"
          columns={PENDING_COLUMNS}
          title="Pending Customers"
        />
      )}
    </div>
  );
}
