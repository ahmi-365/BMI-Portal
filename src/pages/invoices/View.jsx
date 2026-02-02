import { Download, Trash2 } from "lucide-react";
import { useState } from "react";
import { canAccess } from "../../lib/permissionHelper";

import BulkDeleteConfirmationModal from "../../components/common/BulkDeleteConfirmationModal";
import FileDownloadButton from "../../components/common/FileDownloadButton";
import { ListPage } from "../../components/common/ListPage";
import PageMeta from "../../components/common/PageMeta";
import Toast from "../../components/common/Toast";
import { formatAmount } from "../../lib/currencyUtils";
import { formatDate } from "../../lib/dateUtils";
import { invoicesAPI } from "../../services/api";

const COLUMNS = [
  {
    header: "Customer No.",
    accessor: "customer_no",
    sortable: true,
  },
  {
    header: "Company Name",
    accessor: "company",
    sortable: true,
  },
  { header: "Invoice No.", accessor: "invoiceId", filterKey: "invoice_no", sortable: true },
  {
    header: "Invoice Doc",
    accessor: "invoice_doc",
    filterKey: "invoice_doc",
    sortable: false,
    render: (row) => (
      canAccess("view-invoices") && (
        <FileDownloadButton
          file={row.invoice_doc}
          id={row.id}
          endpoint="invoices"
          path="download"
        />
      )
    ),
  },
  {
    header: "Invoice Date",
    accessor: "invoice_date",
    filterKey: "invoice_date",
    filterType: "date-range",
    sortable: true,
    // Use formatDate to ensure DMY format (12 Dec 2025)
    render: (row) => formatDate(row.invoice_date),
  },
  {
    header: "PO No.",
    accessor: "po_no",
    filterKey: "po_no",
    sortable: true,
    render: (row) => {
      const poNoValue = row.po_no ? row.po_no : "-";
      return poNoValue;
    },
  },
  {
    header: "DO No.",
    accessor: "do_no",
    filterKey: "do_no",
    sortable: true,
    render: (row) => {
      const doNoValue = row.do_no ? row.do_no : "-";
      return doNoValue;
    },
  },
  {
    header: "Amount",
    accessor: "amount",
    filterKey: "amount",
    sortable: true,
    render: (row) => {
      const amountValue = row.amount ? row.amount : "0";
      return formatAmount(amountValue);
    },
  },
  // {
  //   header: "Outstanding",
  //   accessor: "outstanding",
  //   filterKey: "outstanding",
  //   sortable: true,
  //   render: (row) => {
  //     const outstandingValue = row.outstanding ? row.outstanding : "0";
  //     return formatAmount(outstandingValue);
  //   },
  // },
  {
    header: "Due Date",
    accessor: "date",
    filterKey: "due_date",
    filterType: "date-range",
    sortable: true,
    // Use formatDate for consistent DMY format
    render: (row) => formatDate(row.date),
  },
  {
    header: "Uploaded At",
    accessor: "created_at",
    filterKey: "uploaded",
    filterType: "date-range",
    sortable: true,
    // Use formatDate for consistent DMY format
    render: (row) => formatDate(row.created_at),
  },
  {
    header: "Uploaded By",
    accessor: "uploaded_by",
    filterKey: "uploaded_by",
  },
];

export default function InvoicesView() {
  const [selectedIds, setSelectedIds] = useState([]);
  const [toast, setToast] = useState({ message: null, type: "success" });
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);


  const handleBulkDeleteClick = () => {
    if (selectedIds.length === 0) {
      setToast({ message: "Please select items to delete", type: "error" });
      return;
    }
    setIsDeleteModalOpen(true);
  };

  const handleBulkDownload = async () => {
    try {
      setIsDownloading(true);
      const blob = await invoicesAPI.bulkDownload(selectedIds);
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `invoices-${new Date().getTime()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      setToast({ message: "Download started successfully", type: "success" });
    } catch (error) {
      console.error("Bulk download failed:", error);
      setToast({
        message: error.message || "Failed to download items",
        type: "error",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSingleDelete = async (id) => {
    try {
      setIsDeleting(true);
      await invoicesAPI.delete(id);
      setToast({ message: "Invoice deleted successfully", type: "success" });
    } catch (error) {
      setToast({
        message: error.message || "Failed to delete invoice",
        type: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    try {
      setIsDeleting(true);
      await invoicesAPI.bulkDelete(selectedIds);
      setToast({ message: "Items deleted successfully", type: "success" });
      setSelectedIds([]);
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Bulk delete failed:", error);
      setToast({
        message: error.message || "Failed to delete items",
        type: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };
  const downloadFile = (blob, filename) => {
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  };

  const handleZipDownload = async () => {
    try {
      setIsDownloading(true);
      const blob = await invoicesAPI.bulkDownload(selectedIds);

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoices-${Date.now()}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setToast({ message: "ZIP download failed", type: "error" });
    } finally {
      setIsDownloading(false);
      setIsDownloadOpen(false);
    }
  };


  const handleCSVDownload = async () => {
    try {
      setIsDownloading(true);
      const blob = await invoicesAPI.exportCSV(selectedIds);

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoices-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setToast({ message: "CSV export failed", type: "error" });
    } finally {
      setIsDownloading(false);
      setIsDownloadOpen(false);
    }
  };


  return (
    <div>
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: null, type: "success" })}
        />
      )}
      <PageMeta
        title="Invoices - BMI Invoice Management System"
        description="Manage and track all invoices. View invoice details, payment status, and associated documents in one place."
      />
      <ListPage
        resourceName="invoices/index"
        columns={COLUMNS}
        title="Invoices"
        subtitle="View and manage all invoices"
        basePath="/invoices"
        showEdit={canAccess("edit-invoices")}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onDelete={canAccess("delete-invoices") ? handleSingleDelete : null}
        headerAction={
          selectedIds.length > 0 ? (
            <div className="flex items-center gap-3 relative">

              {/* DOWNLOAD BUTTON */}
              {canAccess("export-invoices") && (
                <div className="relative">
                  <button
                    onClick={() => setIsDownloadOpen(!isDownloadOpen)}
                    disabled={isDownloading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Download className="w-4 h-4" />
                    Download ({selectedIds.length})
                  </button>

                  {isDownloadOpen && (
                    <div className="absolute right-0 mt-2 w-44 bg-white border rounded-lg shadow-lg z-50">
                      <button
                        onClick={handleZipDownload}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100"
                      >
                        Download ZIP
                      </button>

                      <button
                        onClick={handleCSVDownload}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100"
                      >
                        Export CSV
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* 🔥 BULK DELETE BUTTON (THIS WAS MISSING) */}
              {canAccess("delete-invoices") && (
                <button
                  onClick={handleBulkDeleteClick}
                  disabled={isDeleting}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete ({selectedIds.length})
                </button>
              )}

            </div>
          ) : null
        }

      />
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
