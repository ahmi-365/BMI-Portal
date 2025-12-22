import { useState } from "react";
import { ListPage } from "../../components/common/ListPage";
import PageMeta from "../../components/common/PageMeta";
import FileDownloadButton from "../../components/common/FileDownloadButton";
import Toast from "../../components/common/Toast";
import { ppisAPI } from "../../services/api";
import BulkDeleteConfirmationModal from "../../components/common/BulkDeleteConfirmationModal";
import { Trash2 } from "lucide-react";

const COLUMNS = [
  { header: "PPI No.", accessor: "ppi_no", filterKey: "ppi_no" },
  {
    header: "Company",
    accessor: "user.company",
    filterKey: "user.company",
    render: (row) => row.user?.company || "-",
  },
  { header: "Customer No.", accessor: "customer_no", filterKey: "customer_no" },
  { header: "PO No.", accessor: "po_no", filterKey: "po_no" },
  { header: "Ref No.", accessor: "ref_no", filterKey: "ref_no" },
  { header: "Amount", accessor: "amount", filterKey: "amount" },
  { header: "Remarks", accessor: "remarks", filterKey: "remarks" },
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
    filterKey: "admin.name",
    render: (row) => row.admin?.name || "-",
  },
  {
    header: "Created At",
    accessor: "created_at",
    filterKey: "created_at",
    filterType: "date-range",
    render: (row) =>
      row.created_at ? String(row.created_at).split("T")[0] : "-",
  },
];

export default function PpisView() {
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState({ message: null, type: "success" });

  const handleBulkDeleteClick = () => {
    if (selectedIds.length === 0) {
      setToast({ message: "No items selected", type: "error" });
      return;
    }
    setIsDeleteModalOpen(true);
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
    </div>
  );
}
