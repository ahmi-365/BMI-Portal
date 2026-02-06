import { Check, Download, Trash2 } from "lucide-react";
import { useState } from "react";
import { openBulkConfirm } from "../../components/common/bulkConfirmManager";
import BulkDeleteConfirmationModal from "../../components/common/BulkDeleteConfirmationModal";
import FileDownloadButton from "../../components/common/FileDownloadButton";
import { ListPage } from "../../components/common/ListPage";
import PageMeta from "../../components/common/PageMeta";
import Toast from "../../components/common/Toast";
import { formatAmount } from "../../lib/currencyUtils";
import { formatDate } from "../../lib/dateUtils";
import { canAccess } from "../../lib/permissionHelper";
import { paymentsAPI } from "../../services/api";

// ---------- PDF RENDER BUTTON ----------
const PdfButton = ({ label, file, id, endpoint, path = "download-proof" }) =>
  file && canAccess("view-payments") ? (
    <FileDownloadButton file={file} id={id} endpoint={endpoint} path={path} />
  ) : (
    "-"
  );
const PAID_COLUMNS = [
  {
    header: "Customer No.",
    accessor: "invoice",
    filterKey: "customer_no",
    sortable: true,
    render: (row) => row.user?.customer_no ?? "-",
  },

  {
    header: "Company Name",
    accessor: "company",
    filterKey: "company",
    sortable: true,
    render: (row) => row.user?.company ?? "-",
  },

  {
    header: "Payment Date",
    accessor: "payment_date",
    filterKey: "payment_date",
    filterType: "date-range",
    sortable: true,
    render: (row) => formatDate(row.payment_date),
  },
  {
    header: "Proof of Payment",
    accessor: "proof",
    sortable: false,
    render: (row) => (
      <PdfButton
        file={row.proof}
        id={row.id}
        endpoint="payments"
        path="download-proof"
      />
    ),
  },

  {
    header: "Reference No.",
    accessor: "reference_id",
    filterKey: "reference_id",
  },

  // {
  //   header: "Invoice Doc",
  //   accessor: "invoice_doc",
  //   render: (row) => (
  //     <PdfButton file={row.invoice_doc} id={row.id} endpoint="payments" path="download-invoice" />
  //   ),
  // },

  {
    header: "DO Doc",
    accessor: "do_doc",
    render: (row) => (
      <PdfButton
        file={row.do_doc}
        id={row.id}
        endpoint="payments"
        path="download-do"
      />
    ),
  },

  // {
  //   header: "DN Doc",
  //   accessor: "dn_doc",
  //   render: (row) => (
  //     <PdfButton file={row.dn_doc} id={row.id} endpoint="payments" path="download-dn" />
  //   ),
  // },

  // {
  //   header: "CN Doc",
  //   accessor: "cn_doc",
  //   render: (row) => (
  //     <PdfButton file={row.cn_doc} id={row.id} endpoint="payments" path="download-cn" />
  //   ),
  // },
  {
    header: "Amount (MYR)",
    accessor: "amount",
    filterKey: "amount",
    sortable: true,
    render: (row) => formatAmount(row.amount),
  },

  {
    header: "Status",
    accessor: "status",
    disableFilter: true,
    render: (row) => (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${row.status === 0
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
    filterKey: "customer_no",
    render: (row) => row.user?.customer_no ?? "-",
  },

  {
    header: "Company Name",
    accessor: "companyName",
    filterKey: "company",
    render: (row) => row.user?.company ?? "-",
  },

  // {
  //   header: "Outstanding",
  //   accessor: "outstanding",
  //   filterKey: "outstanding",
  //   render: (row) => formatAmount(row.outstanding),
  // },
  {
    header: "Payment Date",
    accessor: "payment_date",
    filterKey: "payment_date",
    filterType: "date-range",
    render: (row) => formatDate(row.payment_date),
  },

  {
    header: "Proof Of Payment",
    accessor: "proof",
    render: (row) => (
      <PdfButton
        file={row.proof}
        id={row.id}
        endpoint="payments"
        path="download-proof"
      />
    ),
    sortable: false,

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
      <PdfButton
        file={row.do_doc}
        id={row.id}
        endpoint="payments"
        path="download-do"
      />
    ),
  },

  // {
  //   header: "DN DOC",
  //   accessor: "dnDoc",
  //   render: (row) => (
  //     <PdfButton file={row.dn_doc} id={row.id} endpoint="payments" path="download-dn" />
  //   ),
  // },

  // {
  //   header: "CN DOC",
  //   accessor: "cnDoc",
  //   render: (row) => (
  //     <PdfButton file={row.cn_doc} id={row.id} endpoint="payments" path="download-cn" />
  //   ),
  // },
  {
    header: "Amount",
    accessor: "amount",
    filterKey: "amount",
    render: (row) => formatAmount(row.amount),
  },

  {
    header: "Status",
    accessor: "status",
    disableFilter: true,
    render: (row) => (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${row.status === 0
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
    disableFilter: true,

    render: (row) => (
      <button
        onClick={() => onApprove(row)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium transition-all duration-200 text-sm"
      >
        <Check className="w-4 h-4" />
        Approve
      </button>
    ),
  }
  ,
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
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);

  const handleBulkDeleteClick = () => {
    if (selectedIds.length === 0) {
      setToastType("error");
      setToastMessage("No payments selected");
      return;
    }
    setIsDeleteModalOpen(true); //   opens modal
  };

  const handleBulkDownload = async () => {
    try {
      setIsDownloading(true);

      const blob = await paymentsAPI.bulkDownload(selectedIds);

      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `payment-records-${Date.now()}.zip`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      setToastType("success");
      setToastMessage("Download started successfully");
    } catch (error) {
      console.error("Bulk download failed:", error);
      setToastType("error");
      const apiMessage =
        error?.response?.data?.message ||
        "No Files found for the selected payments";

      setToastMessage(apiMessage);

    } finally {
      setIsDownloading(false);
    }
  };


  const handleExportCSV = async () => {
    if (selectedIds.length === 0) {
      setToastType("error");
      setToastMessage("Please select items to export");
      return;
    }

    try {
      setIsDownloading(true);
      let blob;

      if (activeTab === "paid") {
        blob = await paymentsAPI.exportApprovedCSV(selectedIds);
      } else {
        blob = await paymentsAPI.exportPendingCSV(selectedIds);
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `payments-${activeTab}-${Date.now()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      setToastType("success");
      setToastMessage("CSV exported successfully");
    } catch (error) {
      setToastType("error");
      setToastMessage(error.message || "CSV export failed");
    } finally {
      setIsDownloading(false);
      setIsDownloadMenuOpen(false);
    }
  };

  const handleSingleDelete = async (id) => {
    try {
      await paymentsAPI.delete(id);
      setToastType("success");
      setToastMessage("Payment deleted successfully");
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      setToastType("error");
      setToastMessage(error?.message || "Failed to delete payment");
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
        error.message || "Failed to approve payment. Please try again.",
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
            className={`pb-3 px-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "paid"
              ? "border-brand-500 text-brand-500"
              : "border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400"
              }`}
          >
            Paid Invoices
          </button>

          <button
            onClick={() => setActiveTab("not-acknowledged")}
            className={`pb-3 px-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "not-acknowledged"
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
          showEdit={canAccess("edit-payments")}
          addButtonText={canAccess("create-payments") ? "New Payment" : null}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onDelete={canAccess("delete-payments") ? handleSingleDelete : null}
          refreshKey={refreshKey}
          basePath="/payments"
          headerAction={
            selectedIds.length > 0 && (
              <div className="flex items-center gap-3">
                <div className="relative">
                  {canAccess("export-payments") && (
                    <button
                      onClick={() => setIsDownloadMenuOpen((prev) => !prev)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download ({selectedIds.length})
                    </button>
                  )}

                  {isDownloadMenuOpen && canAccess("export-payments") && (
                    <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20">
                      <button
                        onClick={handleBulkDownload}
                        disabled={isDownloading || selectedIds.length === 0}
                        className={`w-full px-4 py-2 text-left text-sm
                            ${isDownloading || selectedIds.length === 0
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-gray-100"
                          }`}
                      >
                        {isDownloading ? "Downloading..." : "Download ZIP"}
                      </button>



                      <button
                        onClick={handleExportCSV}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
                      >
                        Export CSV
                      </button>
                    </div>
                  )}
                </div>

                {canAccess("delete-payments") && (
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
                )}
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
          onDelete={canAccess("delete-payments") ? handleSingleDelete : null}
          refreshKey={refreshKey}
          headerAction={
            selectedIds.length > 0 && (
              <div className="flex items-center gap-3">
                <div className="relative">
                  {canAccess("export-payments") && (
                    <button
                      onClick={() => setIsDownloadMenuOpen((prev) => !prev)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download ({selectedIds.length})
                    </button>
                  )}

                  {isDownloadMenuOpen && canAccess("export-payments") && (
                    <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20">
                      <button
                        onClick={handleBulkDownload}
                        disabled={isDownloading || selectedIds.length === 0}
                        className={`w-full px-4 py-2 text-left text-sm
                           ${isDownloading || selectedIds.length === 0
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-gray-100 "
                          }`}
                      >
                        {isDownloading ? "Downloading..." : "Download ZIP"}
                      </button>


                      <button
                        onClick={handleExportCSV}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
                      >
                        Export CSV
                      </button>
                    </div>
                  )}
                </div>

                {canAccess("delete-payments") && (
                  <button
                    onClick={handleBulkDeleteClick} //   OPEN MODAL
                    disabled={isDeleting}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    {isDeleting
                      ? "Deleting..."
                      : `Delete (${selectedIds.length})`}
                  </button>
                )}
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
