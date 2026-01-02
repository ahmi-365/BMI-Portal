import { useState } from "react";
import { ListPage } from "../../components/common/ListPage";
import PageMeta from "../../components/common/PageMeta";
import FileDownloadButton from "../../components/common/FileDownloadButton";
import Toast from "../../components/common/Toast";
import { ppisAPI } from "../../services/api";
import BulkDeleteConfirmationModal from "../../components/common/BulkDeleteConfirmationModal";
import { Trash2, Download } from "lucide-react";

const COLUMNS = [
  {
    header: "Company",
    accessor: "user.company",
    filterKey: "company",
    render: (row) => row.user?.company || "-",
  },
  { header: "Customer No.", accessor: "customer_no", filterKey: "customer_no" },
  { header: "PO No.", accessor: "po_no", filterKey: "po_no" },
  { header: "Ref No.", accessor: "ref_no", filterKey: "ref_no" },
  { header: "Amount", accessor: "amount", filterKey: "amount" },
  // { header: "Remarks", accessor: "remarks", filterKey: "remarks",disableFilter: true, },
  {
    header: "PPI Date",
    accessor: "ppi_date",
    filterKey: "ppi_date",
    filterType: "date-range",
    render: (row) => (row.ppi_date ? String(row.ppi_date).split("T")[0] : "-"),
  },
  {
    header: "Payment Term",
    accessor: "payment_term",
    filterKey: "payment_term",
    filterType: "date-range",
    render: (row) =>
      row.payment_term ? String(row.payment_term).split("T")[0] : "-",
  },
  { header: "PPI %", accessor: "ppi_percentage", filterKey: "ppi_percentage" },
  {
    header: "PPI Doc",
    accessor: "ppi_doc",
    filterKey: "ppi_doc",
    render: (row) => (
      <FileDownloadButton
        file={row.ppi_doc}
        id={row.id}
        endpoint="ppis"
        path="download"
      />
    ),
  },
  {
    header: "Uploaded By",
    accessor: "admin.name",
    filterKey: "uploaded_by",
    render: (row) => row.admin?.name || "-",
  },
  {
    header: "Created At",
    accessor: "created_at",
    filterKey: "uploaded",
    filterType: "date-range",
    render: (row) =>
      row.created_at ? String(row.created_at).split("T")[0] : "-",
  },
];

export default function PpisView() {
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);
  const [toast, setToast] = useState({ message: null, type: "success" });

  const handleBulkDeleteClick = () => {
    if (selectedIds.length === 0) {
      setToast({ message: "No items selected", type: "error" });
      return;
    }
    setIsDeleteModalOpen(true);
  };

  const handleBulkDownload = async (type) => {
    try {
      setIsDownloading(true);
      let blob;
      if (type === "zip") {
        blob = await ppisAPI.bulkDownload(selectedIds);
      } else if (type === "csv") {
        blob = await ppisAPI.exportCSV(selectedIds);
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ppis-${new Date().getTime()}.${type === "zip" ? "zip" : "csv"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setToast({ message: `${type.toUpperCase()} download started`, type: "success" });
    } catch (error) {
      console.error("Download failed:", error);
      setToast({ message: "Download failed", type: "error" });
    } finally {
      setIsDownloading(false);
    }
  };


  const handleBulkDelete = async () => {
    try {
      setIsDeleting(true);
      await ppisAPI.bulkDelete(selectedIds);
      setToast({
        message: `${selectedIds.length} record(s) deleted successfully`,
        type: "success",
      });
      setSelectedIds([]);
      window.location.reload();
    } catch (error) {
      setToast({
        message: error.message || "Failed to delete records",
        type: "error",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
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
        title="PPI - BMI Invoice Management System"
        description="View and manage PPI records."
      />
      <ListPage
        resourceName="ppis"
        columns={COLUMNS}
        title="PPI"
        subtitle="View and manage PPI records"
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        headerAction={
          selectedIds.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="relative inline-block text-left">
                {/* Download Button */}
                <button
                  onClick={() => setIsDownloadMenuOpen(!isDownloadMenuOpen)}
                  disabled={isDownloading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  {isDownloading ? "Downloading..." : `Download (${selectedIds.length})`}
                  {/* Arrow Icon */}
                  <svg
                    className={`w-4 h-4 ml-2 transition-transform ${isDownloadMenuOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isDownloadMenuOpen && (
                  <ul className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-10 divide-y divide-gray-100">
                    <li>
                      <button
                        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => {
                          handleBulkDownload("zip");
                          setIsDownloadMenuOpen(false);
                        }}
                      >
                        Download ZIP
                      </button>
                    </li>
                    <li>
                      <button
                        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => {
                          handleBulkDownload("csv");
                          setIsDownloadMenuOpen(false);
                        }}
                      >
                        Export CSV
                      </button>
                    </li>
                  </ul>
                )}
              </div>
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
    </div>
  );
}
