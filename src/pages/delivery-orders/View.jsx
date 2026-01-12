import { Download, Trash2 } from "lucide-react";
import { useState } from "react";
import { openBulkConfirm } from "../../components/common/bulkConfirmManager";
import BulkDeleteConfirmationModal from "../../components/common/BulkDeleteConfirmationModal";
import FileDownloadButton from "../../components/common/FileDownloadButton";
import { ListPage } from "../../components/common/ListPage";
import PageMeta from "../../components/common/PageMeta";
import Toast from "../../components/common/Toast";
import { formatDate } from "../../lib/dateUtils";
import { deliveryOrdersAPI } from "../../services/api";

const COLUMNS = [
  {
    header: "Customer No.",
    accessor: "customer_no",
    filterKey: "customer_no",
    render: (row) => row.user?.customer_no || row.customer_no || "-",
  },
  {
    header: "Company",
    accessor: "company",
    filterKey: "company",
    render: (row) => row.user?.company || "-",
  },
  {
    header: "DO No.",
    accessor: "do_no",
    filterKey: "do_no",
    render: (row) => row.do_no || "-",
  },
  {
    header: "DO Doc",
    accessor: "do_doc",
    filterKey: "do_doc",
    render: (row) => (
      <FileDownloadButton
        file={row.do_doc}
        id={row.id}
        endpoint="deliveryorders"
        path="download"
      />
    ),
  },
  {
    header: "Invoice No.",
    accessor: "invoice_no",
    filterKey: "invoice_no",
    render: (row) => row.invoice?.invoiceId || row.invoice_no || "-",
  },
  {
    header: "PO No.",
    accessor: "po_no",
    filterKey: "po_no",
    render: (row) => row.invoice?.po_no || row.po_no || "-",
  },
  {
    header: "Invoice Date",
    accessor: "invoice_date",
    filterKey: "date",
    filterType: "date-range",
        render: (row) => formatDate(row.invoice.invoice_date),
    
  },
  {
    header: "Due Date",
    accessor: "date",
    filterKey: "due_date",
    filterType: "date-range",
           render: (row) => formatDate(row.date),

  },
  {
    header: "Uploaded At",
    accessor: "uploaded_at",
    filterKey: "uploaded_at",
    filterType: "date-range",
    render: (row) => formatDate(row.created_at),
  },
  {
    header: "Uploaded By",
    accessor: "uploaded_by",
    filterKey: "uploaded_by",
    render: (row) => row.admin?.name || "-",
  },
];

export default function DeliveryOrdersView() {
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
      const blob = await deliveryOrdersAPI.bulkDownload(selectedIds);
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `delivery-orders-${new Date().getTime()}.zip`;
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


  const handleBulkDelete = async () => {
    try {
      setIsDeleting(true);
      await deliveryOrdersAPI.bulkDelete(selectedIds);
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
      setLoading(false);
    }
  };
  const handleCSVDownload = async () => {
    try {
      setIsDownloading(true);

      const blob = await deliveryOrdersAPI.exportCSV(selectedIds);

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `delivery-orders-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      setToast({
        message: error.message || "CSV export failed",
        type: "error",
      });
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
        title="Delivery Orders - BMI Invoice Management System"
        description="Manage and track all delivery orders. Monitor shipments, delivery status, and associated documentation."
      />
      <ListPage
        resourceName="deliveryorders"
        columns={COLUMNS}
        title="Delivery Orders"
        subtitle="View and manage all delivery orders"
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}   
        headerAction={
          selectedIds.length > 0 ? (
            <div className="flex items-center gap-3 relative">

              {/* DOWNLOAD DROPDOWN */}
              <div className="relative">
                <button
                  onClick={() => setIsDownloadOpen(!isDownloadOpen)}
                  disabled={isDownloading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
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
                          onConfirm: handleBulkDownload,
                          title: "Download ZIP",
                          message: `Are you sure you want to download ${selectedIds.length} delivery order(s)?`,
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
                          message: `Are you sure you want to export ${selectedIds.length} delivery order(s) as CSV?`,
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

              {/* BULK DELETE */}
              <button
                onClick={handleBulkDeleteClick}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
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

