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
    filterKey: "uploaded_by",
    filterType: "date-range",
    render: (row) => {
      if (!row.invoice?.invoice_date) return "-";
      return row.invoice.invoice_date.split("T")[0];
    },
  },
  {
    header: "Due Date",
    accessor: "date",
    filterKey: "due_date",
    filterType: "date-range",
    render: (row) => {
      if (!row.date) return "-";
      return String(row.date).split("T")[0];
    },
  },
  {
    header: "Uploaded At",
    accessor: "uploaded_at",
    filterKey: "uploaded_at",
    filterType: "date-range",
    render: (row) =>
      row.created_at ? String(row.created_at).split("T")[0] : "-",
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
