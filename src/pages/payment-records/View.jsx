import { useState } from "react";
import { ListPage } from "../../components/common/ListPage";
import PageMeta from "../../components/common/PageMeta";

const PAID_COLUMNS = [
  { header: "Customer No.", accessor: "customerNo" },
  { header: "Company Name", accessor: "companyName" },
  { header: "Amount (MYR)", accessor: "amount" },
  { header: "Payment Date", accessor: "paymentDate" },
  { header: "Proof Of Payment", accessor: "proofOfPayment" },
  { header: "Reference No.", accessor: "referenceNo" },
  { header: "Invoice Doc", accessor: "invoiceDoc" },
  { header: "DO DOC", accessor: "doDoc" },
  { header: "DN DOC", accessor: "dnDoc" },
  { header: "CN DOC", accessor: "cnDoc" },
  { header: "Status", accessor: "status" },
];

const NOT_ACKNOWLEDGED_COLUMNS = [
  { header: "Customer No.", accessor: "customerNo" },
  { header: "Company Name", accessor: "companyName" },
  { header: "Amount", accessor: "amount" },
  { header: "Outstanding", accessor: "outstanding" },
  { header: "Payment Date", accessor: "paymentDate" },
  { header: "Proof Of Payment", accessor: "proofOfPayment" },
  { header: "Reference No.", accessor: "referenceNo" },
  { header: "DO DOC", accessor: "doDoc" },
  { header: "DN DOC", accessor: "dnDoc" },
  { header: "CN DOC", accessor: "cnDoc" },
  { header: "Status", accessor: "status" },
];

export default function PaymentRecordsView() {
  const [activeTab, setActiveTab] = useState("paid");

  return (
    <div>
      <PageMeta
        title="Payment Records - BMI Invoice Management System"
        description="Manage payment records including paid invoices and not acknowledged payments. Track all payment transactions and reconciliations."
      />
      <div className="border-b border-gray-200 dark:border-gray-700 px-6 pt-4">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("paid")}
            className={`pb-3 px-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "paid"
                ? "border-brand-500 text-brand-500"
                : "border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400"
            }`}
          >
            Paid Invoices
          </button>
          <button
            onClick={() => setActiveTab("not-acknowledged")}
            className={`pb-3 px-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "not-acknowledged"
                ? "border-brand-500 text-brand-500"
                : "border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400"
            }`}
          >
            Not Acknowledged
          </button>
        </div>
      </div>

      {activeTab === "paid" && (
        <ListPage
          resourceName="payment-records-paid"
          columns={PAID_COLUMNS}
          title="Paid Invoices"
        />
      )}

      {activeTab === "not-acknowledged" && (
        <ListPage
          resourceName="payment-records-not-acknowledged"
          columns={NOT_ACKNOWLEDGED_COLUMNS}
          title="Not Acknowledged"
        />
      )}
    </div>
  );
}
