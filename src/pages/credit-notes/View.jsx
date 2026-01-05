import { useState } from "react";
import { ListPage } from "../../components/common/ListPage";
import PageMeta from "../../components/common/PageMeta";
import FileDownloadButton from "../../components/common/FileDownloadButton";
import { openBulkConfirm } from "../../components/common/bulkConfirmManager";
import { creditNotesAPI } from "../../services/api";
import Toast from "../../components/common/Toast";
import { Trash2, Download } from "lucide-react";
import BulkDeleteConfirmationModal from "../../components/common/BulkDeleteConfirmationModal";
import { render } from "@fullcalendar/core/preact.js";

const COLUMNS = [
  {
    header: "Customer No.",
    accessor: "customer_no",
    filterKey: "customer_no",
    render: (row) => row.user?.customer_no || "-",
  },
  {
    header: "Company",
    accessor: "company",
    filterKey: "company",
    render: (row) => row.user?.company || "-",
  },
  {
    header: "CN No.",
    accessor: "cn_no",
    filterKey: "cn_no",
    render: (row) => row.cn_no || "N/A",
  },
  {
    header: "Do No.",
    accessor: "do_no",
    filterKey: "do_no",
    render: (row) => row.invoice?.do_no || row.do_no || "-",
  },
  {
    header: "CN Document",
    accessor: "cn_doc",
    filterKey: "cn_doc",
    render: (row) => (
      <FileDownloadButton
        file={row.cn_doc}
        id={row.id}
        endpoint="creditnotes"
        path="download"
      />
    ),
  },
  {
    header: "Do Document",
    accessor: "do_doc",
    filterKey: "do_doc",
    render: (row) => (
      <FileDownloadButton
        file={row.invoice?.do_doc}
        id={row.id}
        endpoint="creditnotes"
        path="download"
      />
    ),
  },
  {
    header: "CN Date",
    accessor: "cn_date",
    filterKey: "cn_date",
    filterType: "date-range",
    render: (row) => {
      if (!row.cn_date) return "-";
      return String(row.cn_date).split("T")[0];
    },
  },
  {
    header: "PO No.",
    accessor: "po_no",
    filterKey: "po_no",
    render: (row) => row.po_no || "N/A",
  },
  {
    header: "Ref No.",
    accessor: "ref_no",
    filterKey: "ref_no",
    render: (row) => row.ref_no || "-",
  },
  {
    header: "Amount",
    accessor: "amount",
    filterKey: "amount",
    render: (row) => row.amount || "-",
  },
  {
    header: "Uploaded At",
    accessor: "uploaded_at",
    filterKey: "uploaded",
    filterType: "date-range",
    render: (row) => {
      if (!row.created_at) return "-";
      return String(row.created_at).split("T")[0];
    },
  },
  {
    header: "Uploaded By",
    accessor: "uploaded_by",
    filterKey: "uploaded_by",
    render: (row) => row.admin?.name || "N/A",
  },
];

export default function CreditNotesView() {
  const [selectedIds, setSelectedIds] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);

  const [toast, setToast] = useState({ message: null, type: "success" });

  const handleBulkDeleteClick = () => {
    if (selectedIds.length === 0) {
      setToast({ message: "No credit notes selected", type: "error" });
      return;
    }
    setIsDeleteModalOpen(true);
  };

  const handleBulkDownload = async () => {
    try {
      setIsDownloading(true);
      const blob = await creditNotesAPI.bulkDownload(selectedIds);
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `credit-notes-${new Date().getTime()}.zip`;
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
      await creditNotesAPI.bulkDelete(selectedIds);
      setToast({
        message: `${selectedIds.length} credit note(s) deleted successfully`,
        type: "success",
      });
      setSelectedIds([]);
      setRefreshKey((prev) => prev + 1);
      setIsDeleteModalOpen(false);
    } catch (error) {
      setToast({
        message: error.message || "Failed to delete credit notes",
        type: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };
  const handleZipDownload = async () => {
    try {
      setIsDownloading(true);

      const blob = await creditNotesAPI.bulkDownload(selectedIds);
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `credit-notes-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
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

      const blob = await creditNotesAPI.exportCSV(selectedIds);
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `credit-notes-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      setToast({ message: "CSV export failed", type: "error" });
    } finally {
      setIsDownloading(false);
      setIsDownloadOpen(false);
    }
  };


  return (
    <>
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: null, type: "success" })}
        />
      )}
      <PageMeta
        title="Credit Notes - BMI Invoice Management System"
        description="Manage and track all credit notes. View credit note details and associated financial records."
      />
      <ListPage
        resourceName="creditnotes"
        columns={COLUMNS}
        title="Credit Notes"
        subtitle="View and manage all credit notes"
        addButtonText="New Credit Note"
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        refreshKey={refreshKey}
        headerAction={
          selectedIds.length > 0 && (
            <div className="relative flex items-center gap-3">
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
                      onClick={() => {
                        setIsDownloadOpen(false);
                        openBulkConfirm({
                          type: "zip",
                          title: "Download ZIP",
                          message: `Are you sure you want to download ${selectedIds.length} credit note(s)?`,
                          confirmText: isDownloading ? "Downloading" : `Download (${selectedIds.length})`,
                          onConfirm: handleZipDownload,
                        });
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100"
                    >
                      Download ZIP
                    </button>

                    <button
                      onClick={() => {
                        setIsDownloadOpen(false);
                        openBulkConfirm({
                          type: "csv",
                          title: "Export CSV",
                          message: `Are you sure you want to export ${selectedIds.length} credit note(s) to CSV?`,
                          confirmText: isDownloading ? "Exporting" : `Export CSV (${selectedIds.length})`,
                          onConfirm: handleCSVDownload,
                        });
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100"
                    >
                      Export CSV
                    </button>
                  </div>
                )}
              </div>

              {/* DELETE BUTTON */}
              <button
                onClick={handleBulkDeleteClick}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Delete ({selectedIds.length})
              </button>
            </div>
          )
        }

      />
      <BulkDeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleBulkDelete}
        isLoading={isDeleting}
        count={selectedIds.length}
      />
    </>
  );
}
