import { useState } from "react";
import { ListPage } from "../../components/common/ListPage";
import PageMeta from "../../components/common/PageMeta";
import FileDownloadButton from "../../components/common/FileDownloadButton";
import { deliveryOrdersAPI } from "../../services/api";
import Toast from "../../components/common/Toast";
import { Trash2 } from "lucide-react";
import BulkDeleteConfirmationModal from "../../components/common/BulkDeleteConfirmationModal";

const COLUMNS = [
  {
    header: "Customer No.",
    accessor: "customer_no",
    render: (row) => row.customer_no || "-",
  },
  {
    header: "Company Name",
    accessor: "company_name",
    render: (row) => row.user.company || "-",
  },
  { header: "DO No.", accessor: "do_no", render: (row) => row.do_no || "-" },
  {
    header: "DO Doc",
    accessor: "do_doc",
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
    render: (row) => row.invoice.invoiceId || "-",
  },
  {
    header: "PO No.",
    accessor: "po_no",
    render: (row) => row.invoice.po_no || "-",
  },
  {
    header: "Invoice Date",
    accessor: "invoice_date",
    render: (row) => {
      if (!row.invoice?.invoice_date) return "-";
      return row.invoice.invoice_date.split("T")[0];
    },
  },

  {
    header: "Amount",
    accessor: "amount",
    render: (row) => (row.invoice.amount ? row.invoice.amount : "0"),
  },
  {
    header: "Uploaded At",
    accessor: "created_at",
    render: (row) =>
      row.created_at ? String(row.created_at).split("T")[0] : "-",
  },
  {
    header: "Uploaded By",
    accessor: "uploaded_by",
    render: (row) => row.uploaded_by || "-",
  },
];

export default function DeliveryOrdersView() {
  const [selectedIds, setSelectedIds] = useState([]);
  const [toast, setToast] = useState({ message: null, type: "success" });
  const [loading, setLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleBulkDeleteClick = () => {
    if (selectedIds.length === 0) {
      setToast({ message: "Please select items to delete", type: "error" });
      return;
    }
    setIsDeleteModalOpen(true);
  };

  const handleBulkDelete = async () => {
    try {
      setLoading(true);
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
            <button
              onClick={handleBulkDeleteClick}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              {loading ? "Deleting..." : `Delete (${selectedIds.length})`}
            </button>
          ) : null
        }
      />
      <BulkDeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleBulkDelete}
        isLoading={loading}
        count={selectedIds.length}
      />
    </div>
  );
}
