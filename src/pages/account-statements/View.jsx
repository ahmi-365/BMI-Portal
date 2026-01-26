import { Download, Trash2 } from "lucide-react";
import { useState } from "react";
import BulkDeleteConfirmationModal from "../../components/common/BulkDeleteConfirmationModal";
import FileDownloadButton from "../../components/common/FileDownloadButton";
import { ListPage } from "../../components/common/ListPage";
import PageMeta from "../../components/common/PageMeta";
import Toast from "../../components/common/Toast";
import { formatDate } from "../../lib/dateUtils";
import { statementsAPI } from "../../services/api";

const COLUMNS = [
  { header: "Customer No", accessor: "customer_no", filterKey: "customer_no", sortable: true },
  {
    header: "Company Name",
    accessor: "company_name",
    filterKey: "company",
    sortable: true,
    render: (row) => row.user?.company || row.company_name || "-",
  },
  {
    header: "Statement Doc",
    accessor: "statement_doc",
    filterKey: "statement_doc",
    sortable: false,
    render: (row) =>
      row.statement_doc ? (
        <FileDownloadButton
          file={row.statement_doc}
          id={row.id}
          endpoint="statements"
          path="download"
        />
      ) : (
        "-"
      ),
  },
  {
    header: "Statement Date",
    accessor: "statement_date",
    filterKey: "statement_date",
    filterType: "date-range",
    sortable: true,
    render: (row) => formatDate(row.statement_date),
  },
  {
    header: "Updated At",
    accessor: "updated_at",
    filterKey: "uploaded",
    filterType: "date-range",
    sortable: true, 
        render: (row) => formatDate(row.updated_at),

  },
  {
    header: "Uploaded By",
    accessor: "uploaded_by",
    filterKey: "uploaded_by",
    sortable: true,
    render: (row) =>
      row.admin?.name || "-",
  },
];

export default function AccountStatementsView() {
  const [selectedIds, setSelectedIds] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState({ message: null, type: "success" });

  const handleBulkDeleteClick = () => {
    if (selectedIds.length === 0) {
      setToast({ message: "No statements selected", type: "error" });
      return;
    }
    setIsDeleteModalOpen(true);
  };

  const handleBulkDownload = async (type) => {
    if (selectedIds.length === 0) {
      setToast({ message: "No statements selected", type: "error" });
      return;
    }

    try {
      setIsDownloading(true);
      let blob;

      if (type === "zip") {
        blob = await statementsAPI.bulkDownload(selectedIds);
      } else if (type === "csv") {
        blob = await statementsAPI.exportCSV(selectedIds);
      }

      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `account-statements-${new Date().getTime()}.${type === "zip" ? "zip" : "csv"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      setToast({ message: "Download started successfully", type: "success" });
    } catch (error) {
      console.error("Bulk download failed:", error);
      setToast({ message: error.message || "Failed to download statements", type: "error" });
    } finally {
      setIsDownloading(false);
    }
  };




  const handleBulkDelete = async () => {
    try {
      setIsDeleting(true);
      await statementsAPI.bulkDelete(selectedIds);
      setToast({
        message: `${selectedIds.length} statement(s) deleted successfully`,
        type: "success",
      });
      setSelectedIds([]);
      setRefreshKey((prev) => prev + 1);
      setIsDeleteModalOpen(false);
    } catch (error) {
      setToast({
        message: error.message || "Failed to delete statements",
        type: "error",
      });
    } finally {
      setIsDeleting(false);
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
        title="Account Statements - BMI Invoice Management System"
        description="Manage and track all account statements. View statement details and associated financial records."
      />
      <ListPage
        resourceName="statements"
        columns={COLUMNS}
        title="Account Statements"
        subtitle="View and manage all account statements"
        addButtonText="New Account Statement"
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        refreshKey={refreshKey}
        headerAction={
          selectedIds.length > 0 && (
            <div className="flex items-center gap-3 relative">
              {/* Bulk Download Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsDownloadMenuOpen(!isDownloadMenuOpen)}
                  disabled={isDownloading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  {isDownloading ? "Downloading..." : `Download (${selectedIds.length})`}
                  <svg
                    className={`w-4 h-4 ml-1 transition-transform duration-300 ${isDownloadMenuOpen ? "rotate-180" : ""
                      }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isDownloadMenuOpen && (
                  <ul className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-20 divide-y divide-gray-100">
                    <li>
                      <button
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                        onClick={() => {
                          setIsDownloadMenuOpen(false);
                          handleBulkDownload("zip");
                        }}
                      >
                        Download ZIP
                      </button>
                    </li>
                    <li>
                      <button
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                        onClick={() => {
                          setIsDownloadMenuOpen(false);
                          handleBulkDownload("csv");
                        }}
                      >
                        Export CSV
                      </button>
                    </li>
                  </ul>
                )}
              </div>

              {/* Bulk Delete Button */}
              <button
                onClick={handleBulkDeleteClick}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? "Deleting..." : `Delete (${selectedIds.length})`}
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
