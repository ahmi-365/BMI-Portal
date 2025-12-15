import { useState } from "react";
import { ListPage } from "../../components/common/ListPage";
import PageMeta from "../../components/common/PageMeta";
import FileDownloadButton from "../../components/common/FileDownloadButton";
import { invoicesAPI } from "../../services/api";
import Toast from "../../components/common/Toast";
import { Trash2 } from "lucide-react";
import BulkDeleteConfirmationModal from "../../components/common/BulkDeleteConfirmationModal";

const COLUMNS = [
  {
    header: "Customer No.",
    accessor: "customer_no",
    render: (row) => row.user?.customer_no ?? row.user?.id ?? "-",
  },
  {
    header: "Company Name",
    accessor: "companyName",
    render: (row) => row.user?.company ?? "-",
  },
  { header: "Invoice No.", accessor: "invoiceId" },
  {
    header: "Invoice Doc",
    accessor: "invoice_doc",
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
    render: (row) => {
      const poNoValue = row.po_no ? row.po_no : "-";
      return poNoValue;
    },
  },
  {
    header: "DO No.",
    accessor: "do_no",
    render: (row) => {
      const doNoValue = row.do_no ? row.do_no : "-";
      return doNoValue;
    },
  },
  {
    header: "Amount",
    accessor: "amount",
    render: (row) => {
      const amountValue = row.amount ? row.amount : "0";
      return amountValue;
    },
  },
  {
    header: "Outstanding",
    accessor: "outstanding",
    render: (row) => {
      const outstandingValue = row.outstanding ? row.outstanding : "0";
      return outstandingValue;
    },
  },
  {
    header: "Due Date",
    accessor: "date",
    render: (row) => {
      const dateValue = row.date ? String(row.date).split("T")[0] : "-";
      return dateValue;
    },
  },
  {
    header: "Uploaded At",
    accessor: "created_at",
    render: (row) => {
      if (!row.created_at) return "-";
      return row.created_at.split("T")[0]; // Only date part
    },
  },
  {
    header: "Uploaded By",
    accessor: "uploadedBy",
    render: (row) => row.admin?.name ?? "-",
  },
];

export default function InvoicesView() {
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
        title="Invoices - BMI Invoice Management System"
        description="Manage and track all invoices. View invoice details, payment status, and associated documents in one place."
      />
      <ListPage
        resourceName="invoices/index"
        columns={COLUMNS}
        title="Invoices"
        basePath="/invoices"
        showEdit={true}
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
