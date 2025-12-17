import { useState } from "react";
import { ListPage } from "../../components/common/ListPage";
import PageMeta from "../../components/common/PageMeta";
import FileDownloadButton from "../../components/common/FileDownloadButton";
import { creditNotesAPI } from "../../services/api";
import Toast from "../../components/common/Toast";
import { Trash2 } from "lucide-react";
import BulkDeleteConfirmationModal from "../../components/common/BulkDeleteConfirmationModal";
import { render } from "@fullcalendar/core/preact.js";

const COLUMNS = [
  { header: "Customer No.", accessor: "customer_no" },
  {
    header: "Company",
    accessor: "companyName",
    render: (row) => row.user?.company || "-",
  }, // from nested user
  { header: "CN No.", accessor: "cn_no", render: (row) => row.cn_no || "N/A" },
  { header: "Do No.", accessor: "do_no", 
        render: (row) => row.invoice?.do_no || "-",

    
   },

  {

    header: "CN Document",
    accessor: "cn_doc",
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
    render: (row) => new Date(row.cn_date).toLocaleDateString(),
  },
  { header: "PO No.", accessor: "po_no", render: (row) => row.po_no || "N/A" },
  { header: "Ref No.", accessor: "ref_no", render: (row) => row.ref_no || "-" },
  { header: "Amount", accessor: "amount" },
  // {
  //   header: "Remarks",
  //   accessor: "remarks",
  //   render: (row) => row.remarks || "-",
  // },
  // {
  //   header: "Payment Term",
  //   accessor: "payment_term",
  //   render: (row) => (row.payment_term ? row.payment_term.split("T")[0] : "-"),
  // },
  {
    header: "Uploaded At",
    accessor: "created_at",
    render: (row) => new Date(row.created_at).toLocaleString(),
  },
  {
    header: "Uploaded By",
    accessor: "admin_id",
    render: (row) => row.admin?.name || "N/A",
  },
];

export default function CreditNotesView() {
  const [selectedIds, setSelectedIds] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState({ message: null, type: "success" });

  const handleBulkDeleteClick = () => {
    if (selectedIds.length === 0) {
      setToast({ message: "No credit notes selected", type: "error" });
      return;
    }
    setIsDeleteModalOpen(true);
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
        resourceName="creditnotes"
        columns={COLUMNS}
        title="Credit Notes"
        addButtonText="New Credit Note"
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
