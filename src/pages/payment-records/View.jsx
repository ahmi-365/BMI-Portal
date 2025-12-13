import { useState } from "react";
import { ListPage } from "../../components/common/ListPage";
import PageMeta from "../../components/common/PageMeta";
import { downloadBlob, paymentsAPI } from "../../services/api";
import { Check } from "lucide-react";
import Toast from "../../components/common/Toast";

const openPdf = async (path, filename) => {
  try {
    const blob = await downloadBlob(path);
    const blobUrl = URL.createObjectURL(blob);

    const newWin = window.open(blobUrl, "_blank");

    if (!newWin) {
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename || "file.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
    }

    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
  } catch (err) {
    console.error("Download failed:", err);
    alert("Failed to download document. Please try again.");
  }
};

// ---------- PDF RENDER BUTTON ----------
const PdfButton = ({ label, file, id, endpoint }) =>
  file ? (
    <button
      onClick={() => openPdf(`/${endpoint}/download-proof/${id}`, file)}
      className="text-brand-500 hover:underline"
    >
      {file}
    </button>
  ) : (
    "-"
  );
const PAID_COLUMNS = [
  { header: "Amount (MYR)", accessor: "amount" },

  {
    header: "Customer No.",
    accessor: "invoice",
    render: (row) => row.user?.customer_no ?? "-",
  },

  {
    header: "Company Name",
    accessor: "company",
    render: (row) => row.user?.company ?? "-",
  },

  {
    header: "Payment Date",
    accessor: "payment_date",
    render: (row) => (row.payment_date ? row.payment_date.split("T")[0] : "-"),
  },
  {
    header: "Proof of Payment",
    accessor: "proof",
    render: (row) => (
      <PdfButton
        label="Proof"
        file={row.proof}
        id={row.id}
        endpoint="payments"
      />
    ),
  },

  { header: "Reference No.", accessor: "reference_id" },

  {
    header: "Invoice Doc",
    accessor: "invoice_doc",
    render: (row) => (
      <PdfButton file={row.invoice_doc} id={row.id} endpoint="payments" />
    ),
  },

  {
    header: "DO Doc",
    accessor: "do_doc",
    render: (row) => (
      <PdfButton file={row.do_doc} id={row.id} endpoint="payments" />
    ),
  },

  {
    header: "DN Doc",
    accessor: "dn_doc",
    render: (row) => (
      <PdfButton file={row.dn_doc} id={row.id} endpoint="payments" />
    ),
  },

  {
    header: "CN Doc",
    accessor: "cn_doc",
    render: (row) => (
      <PdfButton file={row.cn_doc} id={row.id} endpoint="payments" />
    ),
  },

  { header: "Status", accessor: "status" },
];

// ===================================================================
// NOT ACKNOWLEDGED COLUMNS WITH APPROVE ACTION
// ===================================================================
const createNotAcknowledgedColumns = (onApprove) => [
  {
    header: "Customer No.",
    accessor: "customerNo",
    render: (row) => row.user?.customer_no ?? row.user?.id ?? "-",
  },

  {
    header: "Company Name",
    accessor: "companyName",
    render: (row) => row.user?.company ?? "-",
  },

  { header: "Amount", accessor: "amount" },
  { header: "Outstanding", accessor: "outstanding" },
  { header: "Payment Date", accessor: "paymentDate" },

  {
    header: "Proof Of Payment",
    accessor: "proofOfPayment",
    render: (row) => (
      <PdfButton file={row.proof} id={row.id} endpoint="payments" />
    ),
  },

  { header: "Reference No.", accessor: "referenceNo" },

  {
    header: "DO DOC",
    accessor: "doDoc",
    render: (row) => (
      <PdfButton file={row.do_doc} id={row.id} endpoint="payments" />
    ),
  },

  {
    header: "DN DOC",
    accessor: "dnDoc",
    render: (row) => (
      <PdfButton file={row.dn_doc} id={row.id} endpoint="payments" />
    ),
  },

  {
    header: "CN DOC",
    accessor: "cnDoc",
    render: (row) => (
      <PdfButton file={row.cn_doc} id={row.id} endpoint="payments" />
    ),
  },

  { header: "Status", accessor: "status" },

  {
    header: "Approve",
    accessor: "actions",
    render: (row) => (
      <button
        onClick={() => onApprove(row)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium transition-all duration-200 text-sm"
      >
        <Check className="w-4 h-4" />
        Approve
      </button>
    ),
  },
];

// Original NOT_ACKNOWLEDGED_COLUMNS (kept for reference if needed)
const NOT_ACKNOWLEDGED_COLUMNS = [
  {
    header: "Customer No.",
    accessor: "customerNo",
    render: (row) => row.user?.customer_no ?? row.user?.id ?? "-",
  },

  {
    header: "Company Name",
    accessor: "companyName",
    render: (row) => row.user?.company ?? "-",
  },

  { header: "Amount", accessor: "amount" },
  { header: "Outstanding", accessor: "outstanding" },
  { header: "Payment Date", accessor: "paymentDate" },

  {
    header: "Proof Of Payment",
    accessor: "proofOfPayment",
    render: (row) => (
      <PdfButton file={row.proof} id={row.id} endpoint="payments" />
    ),
  },

  { header: "Reference No.", accessor: "referenceNo" },

  {
    header: "DO DOC",
    accessor: "doDoc",
    render: (row) => (
      <PdfButton file={row.do_doc} id={row.id} endpoint="payments" />
    ),
  },

  {
    header: "DN DOC",
    accessor: "dnDoc",
    render: (row) => (
      <PdfButton file={row.dn_doc} id={row.id} endpoint="payments" />
    ),
  },

  {
    header: "CN DOC",
    accessor: "cnDoc",
    render: (row) => (
      <PdfButton file={row.cn_doc} id={row.id} endpoint="payments" />
    ),
  },

  { header: "Status", accessor: "status" },
];

export default function PaymentRecordsView() {
  const [activeTab, setActiveTab] = useState("paid");
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState("success");

  const handleApprovePayment = async (row) => {
    try {
      const formData = new FormData();
      formData.append("payment_id", row.id);

      const result = await paymentsAPI.approve(formData);

      setToastType("success");
      setToastMessage("Payment approved successfully!");

      // Refresh the list after approval
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Approval failed:", error);
      setToastType("error");
      setToastMessage(
        error.message || "Failed to approve payment. Please try again."
      );
    }
  };

  const notAcknowledgedColumns =
    createNotAcknowledgedColumns(handleApprovePayment);

  return (
    <div>
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}

      <PageMeta
        title="Payment Records - BMI Invoice Management System"
        description="Manage payment records including paid invoices and not acknowledged payments."
      />

      {/* ---------- TABS ---------- */}
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

      {/* ---------- TABLES ---------- */}
      {activeTab === "paid" && (
        <ListPage
          resourceName="payments"
          columns={PAID_COLUMNS}
          title="Paid Invoices"
          showEdit={false}
        />
      )}

      {activeTab === "not-acknowledged" && (
        <ListPage
          resourceName="payment-records-not-acknowledged"
          columns={notAcknowledgedColumns}
          title="Not Acknowledged"
          showEdit={false}
        />
      )}
    </div>
  );
}
