import { useState } from "react";
import { ListPage } from "../../components/common/ListPage";
import PageMeta from "../../components/common/PageMeta";
import { downloadBlob, paymentsAPI } from "../../services/api";
import { Check, Trash2, Download } from "lucide-react";
import Toast from "../../components/common/Toast";
import { formatDateISO } from "../../lib/dateUtils";
import BulkDeleteConfirmationModal from "../../components/common/BulkDeleteConfirmationModal";

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
      onClick={(e) => {
        e.stopPropagation();
        openPdf(`/${endpoint}/download-proof/${id}`, file);
      }}
      className="text-brand-500 hover:underline"
    >
      {file}
    </button>
  ) : (
    "-"
  );
const PAID_COLUMNS = [
  {
    header: "Amount (MYR)",
    accessor: "amount",
    filterKey: "amount",
  },

  {
    header: "Customer No.",
    accessor: "invoice",
    filterKey: "user_invoices",
    render: (row) => row.user?.customer_no ?? "-",
  },

  {
    header: "Company Name",
    accessor: "company",
    filterKey: "company",
    render: (row) => row.user?.company ?? "-",
  },

  {
    header: "Payment Date",
    accessor: "payment_date",
    filterKey: "payment_date",
    filterType: "date-range",
    render: (row) => formatDateISO(row.payment_date),
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

  {
    header: "Reference No.",
    accessor: "reference_id",
    filterKey: "reference_id",
  },

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

  {
    header: "Status",
    accessor: "status",
    disableFilter: true,
    render: (row) => (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          row.status === 0
            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
            : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
        }`}
      >
        {row.status === 0 ? "Pending" : "Approved"}
      </span>
    ),
  },
];

// ===================================================================
// NOT ACKNOWLEDGED COLUMNS WITH APPROVE ACTION
// ===================================================================
const createNotAcknowledgedColumns = (onApprove) => [
  {
    header: "Customer No.",
    accessor: "customerNo",
    filterKey: "user_invoices",
    render: (row) => row.user?.customer_no ?? "-",
  },

  {
    header: "Company Name",
    accessor: "companyName",
    filterKey: "company",
    render: (row) => row.user?.company ?? "-",
  },

  {
    header: "Amount",
    accessor: "amount",
    filterKey: "amount",
  },
  {
    header: "Outstanding",
    accessor: "outstanding",
    filterKey: "outstanding",
  },
  {
    header: "Payment Date",
    accessor: "payment_date",
    filterKey: "payment_date",
    filterType: "date-range",
    render: (row) => formatDateISO(row.payment_date),
  },

  {
    header: "Proof Of Payment",
    accessor: "proofOfPayment",
    render: (row) => (
      <PdfButton file={row.proof} id={row.id} endpoint="payments" />
    ),
  },

  {
    header: "Reference No.",
    accessor: "reference_id",
    filterKey: "reference_id",
  },

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

  {
    header: "Status",
    accessor: "status",
    disableFilter: true,
    render: (row) => (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          row.status === 0
            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
            : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
        }`}
      >
        {row.status === 0 ? "Pending" : "Approved"}
      </span>
    ),
  },
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

export default function PaymentRecordsView() {
  const [activeTab, setActiveTab] = useState("paid");
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState("success");
  const [selectedIds, setSelectedIds] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleBulkDeleteClick = () => {
    if (selectedIds.length === 0) {
      setToastType("error");
      setToastMessage("No payments selected");
      return;
    }
    setIsDeleteModalOpen(true); // ✅ opens modal
  };

  const handleBulkDownload = async () => {
    try {
      setIsDownloading(true);
      const blob = await paymentsAPI.bulkDownload(selectedIds);
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `payment-records-${new Date().getTime()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      setToastType("success");
      setToastMessage("Download started successfully");
    } catch (error) {
      console.error("Bulk download failed:", error);
      setToastType("error");
      setToastMessage(error.message || "Failed to download items");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleBulkDelete = async () => {
    try {
      setIsDeleting(true);
      await paymentsAPI.bulkDelete(selectedIds);
      setToastType("success");
      setToastMessage(`${selectedIds.length} payment(s) deleted successfully`);
      setSelectedIds([]);
      setRefreshKey((prev) => prev + 1);
      setIsDeleteModalOpen(false);
    } catch (error) {
      setToastType("error");
      setToastMessage(error.message || "Failed to delete payments");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleApprovePayment = async (row) => {
    try {
      const result = await paymentsAPI.approve(row.id);

      setToastType("success");
      setToastMessage("Payment approved successfully!");

      // Refresh the list after approval
      setRefreshKey((prev) => prev + 1);
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
          resourceName="payments/approved"
          columns={PAID_COLUMNS}
          title="Paid Invoices"
          subtitle="View all paid and processed invoices"
          showEdit={false}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          refreshKey={refreshKey}
          headerAction={
            selectedIds.length > 0 && (
              <div className="flex items-center gap-3">
                {/* <button
                  onClick={handleBulkDownload}
                  disabled={isDownloading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  {isDownloading
                    ? "Downloading..."
                    : `Download (${selectedIds.length})`}
                </button> */}
                <button
                  onClick={handleBulkDeleteClick}
                  disabled={isDeleting}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  {isDeleting
                    ? "Deleting..."
                    : `Delete (${selectedIds.length})`}
                </button>
              </div>
            )
          }
        />
      )}

      {activeTab === "not-acknowledged" && (
        <ListPage
          resourceName="payments/pending"
          columns={notAcknowledgedColumns}
          title="Not Acknowledged"
          subtitle="View pending payment acknowledgments"
          showEdit={false}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          refreshKey={refreshKey}
          headerAction={
            selectedIds.length > 0 && (
              <div className="flex items-center gap-3">
                {/* <button
                  onClick={handleBulkDownload}
                  disabled={isDownloading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  {isDownloading
                    ? "Downloading..."
                    : `Download (${selectedIds.length})`}
                </button> */}
                <button
                  onClick={handleBulkDeleteClick} // ✅ OPEN MODAL
                  disabled={isDeleting}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  {isDeleting
                    ? "Deleting..."
                    : `Delete (${selectedIds.length})`}
                </button>
              </div>
            )
          }
        />
      )}
      <BulkDeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleBulkDelete}
        isLoading={isDeleting}
        count={selectedIds.length}
      />
    </div>
  );
}
