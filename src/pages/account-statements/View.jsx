import { useState } from "react";
import { ListPage } from "../../components/common/ListPage";
import PageMeta from "../../components/common/PageMeta";
import { downloadBlob, statementsAPI } from "../../services/api";
import Toast from "../../components/common/Toast";
import { Trash2 } from "lucide-react";
import BulkDeleteConfirmationModal from "../../components/common/BulkDeleteConfirmationModal";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

const COLUMNS = [
  { header: "Customer No", accessor: "customer_no" },
  {
    header: "Company Name",
    accessor: "company_name",
    render: (row) => row.user?.company || row.company_name || "-",
  },
  {
    header: "Statement Doc",
    accessor: "statement_doc",
    render: (row) =>
      row.statement_doc ? (
        <button
          onClick={async () => {
            try {
              const blob = await downloadBlob(`/statements/download/${row.id}`);
              const blobUrl = URL.createObjectURL(blob);
              // Try to open in new tab; if blocked, fallback to triggering download
              const newWin = window.open(blobUrl, "_blank");
              if (!newWin) {
                const a = document.createElement("a");
                a.href = blobUrl;
                a.download = row.statement_doc || "statement.pdf";
                document.body.appendChild(a);
                a.click();
                a.remove();
              }
              // Revoke object URL after a short delay to ensure it loaded
              setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
            } catch (err) {
              console.error("Download failed:", err);
              alert(
                "Failed to download statement. Please sign in or try again."
              );
            }
          }}
          className="text-brand-500 hover:underline"
        >
          {row.statement_doc}
        </button>
      ) : (
        "-"
      ),
  },
  {
    header: "Statement Date",
    accessor: "statement_date",
    filterKey: "statement_date",
    filterType: "date-range",
    render: (row) =>
      row.statement_date ? row.statement_date.split("T")[0] : "-",
  },
  {
    header: "Updated At",
    accessor: "updated_at",
    filterKey: "updated_at",
    filterType: "date-range",
    render: (row) =>
      row.updated_at || row.created_at
        ? (row.updated_at || row.created_at).split("T")[0]
        : "-",
  },

  {
    header: "Uploaded By",
    accessor: "uploaded_by",
    render: (row) =>
      row.admin?.name || row.user?.name || row.uploaded_by || "-",
  },
];

export default function AccountStatementsView() {
  const [selectedIds, setSelectedIds] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState({ message: null, type: "success" });

  const handleBulkDeleteClick = () => {
    if (selectedIds.length === 0) {
      setToast({ message: "No statements selected", type: "error" });
      return;
    }
    setIsDeleteModalOpen(true);
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
            <button
              onClick={handleBulkDeleteClick}
              disabled={isDeleting}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
            >
              <Trash2 size={18} />
              {isDeleting ? "Deleting..." : `Delete (${selectedIds.length})`}
            </button>
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
