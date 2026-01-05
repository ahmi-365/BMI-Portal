import { useState } from "react";
import { ListPage } from "../../components/common/ListPage";
import { openBulkConfirm } from "../../components/common/bulkConfirmManager";
import PageMeta from "../../components/common/PageMeta";
import FileDownloadButton from "../../components/common/FileDownloadButton";
import { invoicesAPI } from "../../services/api";
import Toast from "../../components/common/Toast";
import { Trash2, Download } from "lucide-react";
import BulkDeleteConfirmationModal from "../../components/common/BulkDeleteConfirmationModal";

const COLUMNS = [
  {
    header: "Customer No.",
    accessor: "customer_no",
  },
  {
    header: "Company Name",
    accessor: "company",
  },
  { header: "Invoice No.", accessor: "invoiceId", filterKey: "invoice_no" },
  {
    header: "Invoice Doc",
    accessor: "invoice_doc",
    filterKey: "invoice_doc",
    render: (row) => (
      <FileDownloadButton
        file={row.invoice_doc}
        id={row.id}
        endpoint="invoices"
        path="download"
      />
    ),
  },
  {
    header: "Invoice Date",
    accessor: "invoice_date",
    filterKey: "invoice_date",
    filterType: "date-range",
    render: (row) => {
      const invoiceDateValue = row.invoice_date
        ? String(row.invoice_date).split("T")[0]
        : "-";
      return invoiceDateValue;
    },
  },
  {
    header: "PO No.",
    accessor: "po_no",
    filterKey: "po_no",
    render: (row) => {
      const poNoValue = row.po_no ? row.po_no : "-";
      return poNoValue;
    },
  },
  {
    header: "DO No.",
    accessor: "do_no",
    filterKey: "do_no",

    render: (row) => {
      const doNoValue = row.do_no ? row.do_no : "-";
      return doNoValue;
    },
  },
  {
    header: "Amount",
    accessor: "amount",
    filterKey: "amount",
    render: (row) => {
      const amountValue = row.amount ? row.amount : "0";
      return amountValue;
    },
  },
  {
    header: "Outstanding",
    accessor: "outstanding",
    filterKey: "outstanding",
    render: (row) => {
      const outstandingValue = row.outstanding ? row.outstanding : "0";
      return outstandingValue;
    },
  },
  {
    header: "Due Date",
    accessor: "date",
    filterKey: "due_date",
    filterType: "date-range",
    render: (row) => {
      const dateValue = row.date ? String(row.date).split("T")[0] : "-";
      return dateValue;
    },
  },
  {
    header: "Uploaded At",
    accessor: "created_at",
    filterKey: "uploaded_at",
    filterType: "date-range",
    render: (row) => {
      if (!row.created_at) return "-";
      return row.created_at.split("T")[0]; // Only date part
    },
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
      window.location.reload();
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
      window.location.reload();
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
        showEdit={true}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onDelete={handleSingleDelete}
        headerAction={
          selectedIds.length > 0 ? (
            <div className="flex items-center gap-3 relative">

              {/* DOWNLOAD BUTTON */}
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
                      onClick={() =>
                        openBulkConfirm({
                          type: "zip",
                          onConfirm: handleZipDownload,
                          title: "Download ZIP",
                          message: `Are you sure you want to download ${selectedIds.length} invoice(s)?`,
                          confirmText: isDownloading ? "Downloading" : "Yes, Download",
                        })
                      }
                      className="w-full px-4 py-2 text-left hover:bg-gray-100"
                    >
                      Download ZIP
                    </button>

                    <button
                      onClick={() =>
                        openBulkConfirm({
                          type: "csv",
                          onConfirm: handleCSVDownload,
                          title: "Export CSV",
                          message: `Are you sure you want to export ${selectedIds.length} invoice(s) as CSV?`,
                          confirmText: isDownloading ? "Downloading" : "Yes, Export",
                        })
                      }
                      className="w-full px-4 py-2 text-left hover:bg-gray-100"
                    >
                      Export CSV
                    </button>
                  </div>
                )}
              </div>

              {/* 🔥 BULK DELETE BUTTON (THIS WAS MISSING) */}
              <button
                onClick={handleBulkDeleteClick}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4" />
                Delete ({selectedIds.length})
              </button>

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
