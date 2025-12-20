import { useState } from "react";
import { render } from "@fullcalendar/core/preact.js";
import { ListPage } from "../../components/common/ListPage";
import PageMeta from "../../components/common/PageMeta";
import FileDownloadButton from "../../components/common/FileDownloadButton";
import { debitNotesAPI } from "../../services/api";
import Toast from "../../components/common/Toast";
import { Trash2 } from "lucide-react";
import BulkDeleteConfirmationModal from "../../components/common/BulkDeleteConfirmationModal";

const COLUMNS = [
  {
    header: "Customer No.",
    accessor: "customer_no",
    filterKey: "customer_no",
    render: (row) => row.customer_no || "-",
  },
  {
    header: "Company Name",
    accessor: "company_name",
    filterKey: "company",
    render: (row) => row.user.company || "-",
  },
  {
    header: "DN No.",

    accessor: "dn_no",
    filterKey: "dn_no",
    // render: (row) => row.dn_no || "-" ,
    render: (row) => row.dn_no || "-",
  },
  {
    header: "DN Document",
    accessor: "dn_doc",
    filterKey: "dn_doc",
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
    render: (row) => (row.dn_date ? String(row.dn_date).split("T")[0] : "-"),
  },

  {
    header: "PO No.",
    accessor: "po_no",
    filterKey: "po_no",
    render: (row) => (row.po_no ? row.po_no : "-"),
    endpoint: "debitnotes",
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
    render: (row) => (row.amount ? row.amount : "0"),
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
    filterKey: "uploaded_at",
    filterType: "date-range",
    render: (row) =>
      row.created_at ? String(row.created_at).split("T")[0] : "-",
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState({ message: null, type: "success" });

  const handleBulkDeleteClick = () => {
    if (selectedIds.length === 0) {
      setToast({ message: "No debit notes selected", type: "error" });
      return;
    }
    setIsDeleteModalOpen(true);
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
