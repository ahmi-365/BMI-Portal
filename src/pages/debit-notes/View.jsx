import { Download, Trash2 } from "lucide-react";
import { useState } from "react";
import { openBulkConfirm } from "../../components/common/bulkConfirmManager";
import BulkDeleteConfirmationModal from "../../components/common/BulkDeleteConfirmationModal";
import FileDownloadButton from "../../components/common/FileDownloadButton";
import { ListPage } from "../../components/common/ListPage";
import PageMeta from "../../components/common/PageMeta";
import Toast from "../../components/common/Toast";
import { formatAmount } from "../../lib/currencyUtils";
import { formatDate } from "../../lib/dateUtils";
import { debitNotesAPI } from "../../services/api";

const COLUMNS = [
  {
    header: "Customer No.",
    accessor: "customer_no",
    filterKey: "customer_no",
    sortable: true,
    render: (row) => row.customer_no || "-",
  },
  {
    header: "Company Name",
    accessor: "company_name",
    filterKey: "company",
    sortable: true,
    render: (row) => row.user.company || "-",
  },
  {
    header: "DN No.",
    accessor: "dn_no",
    filterKey: "dn_no",
    sortable: true,
    render: (row) => row.dn_no || "-",
  },
  {
    header: "DN Document",
    accessor: "dn_doc",
    filterKey: "dn_doc",
    sortable: false,
    render: (row) => (
      <FileDownloadButton
        file={row.dn_doc}
        id={row.id}
        endpoint="debitnotes"
        path="download"
      />
    ),
  },
  {
    header: "DN Date",
    accessor: "dn_date",
    filterKey: "dn_date",
    filterType: "date-range",
    sortable: true,
    render: (row) => formatDate(row.dn_date),
  },
  {
    header: "PO No.",
    accessor: "po_no",
    filterKey: "po_no",
    sortable: true,
    render: (row) => (row.po_no ? row.po_no : "-"),
    endpoint: "debitnotes",
  },
  {
    header: "Ref No.",
    accessor: "ref_no",
    filterKey: "ref_no",
    sortable: true,
    render: (row) => row.ref_no || "-",
  },
  {
    header: "Amount",
    accessor: "amount",
    filterKey: "amount",
    sortable: true,
    render: (row) => formatAmount(row.amount ? row.amount : "0"),
  },
  // {
  //   header: "Payment Term",
  //   accessor: "payment_term",
  //   render: (row) => {
  //     if (!row.payment_term) return "-";
  //     return row.payment_term.split("T")[0];
  //   },
  // },
  // {
  //   header: "Remarks",
  //   accessor: "remarks",
  //   render: (row) => row.remarks || "-",
  // },
  {
    header: "Uploaded At",
    accessor: "created_at",
    filterKey: "uploaded",
    filterType: "date-range",
    render: (row) => formatDate(row.created_at),
  },
  {
    header: "Uploaded By",
    accessor: "admin_id",
    filterKey: "uploaded_by",
    render: (row) => row.admin.name || "-",
  },
];

export default function DebitNotesView() {
  const [selectedIds, setSelectedIds] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);

  const [toast, setToast] = useState({ message: null, type: "success" });

  

  const handleBulkDeleteClick = () => {
    if (selectedIds.length === 0) {
      setToast({ message: "No debit notes selected", type: "error" });
      return;
    }
    setIsDeleteModalOpen(true);
  };

  const handleBulkDownload = async () => {
    try {
      setIsDownloading(true);
      const blob = await debitNotesAPI.bulkDownload(selectedIds);
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `debit-notes-${new Date().getTime()}.zip`;
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
      await debitNotesAPI.bulkDelete(selectedIds);
      setToast({
        message: `${selectedIds.length} debit note(s) deleted successfully`,
        type: "success",
      });
      setSelectedIds([]);
      setRefreshKey((prev) => prev + 1);
      setIsDeleteModalOpen(false);
    } catch (error) {
      setToast({
        message: error.message || "Failed to delete debit notes",
        type: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };
const handleZipDownload = async () => {
  try {
    setIsDownloading(true);
    const blob = await debitNotesAPI.bulkDownload(selectedIds);

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `debit-notes-${Date.now()}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  } catch {
    setToast({ message: "ZIP download failed", type: "error" });
  } finally {
    setIsDownloading(false);
    setIsDownloadOpen(false);
  }
};

const handleCSVDownload = async () => {
  try {
    setIsDownloading(true);
    const blob = await debitNotesAPI.exportCSV(selectedIds);

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `debit-notes-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  } catch {
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
        title="Debit Notes - BMI Invoice Management System"
        description="Manage and track all debit notes. View debit note details and associated financial records."
      />
      <ListPage
        resourceName="debitnotes"
        columns={COLUMNS}
        title="Debit Notes"
        subtitle="View and manage all debit notes"
        addButtonText="New Debit Note"
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        refreshKey={refreshKey}
        headerAction={
  selectedIds.length > 0 && (
    <div className="flex items-center gap-3 relative">
      
      {/* Download Dropdown */}
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
                  onConfirm: handleZipDownload,
                  title: "Download ZIP",
                  message: `Are you sure you want to download ${selectedIds.length} debit note(s)?`,
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
                  message: `Are you sure you want to export ${selectedIds.length} debit note(s) as CSV?`,
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

      {/* Delete */}
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
    </div>
  );
}
