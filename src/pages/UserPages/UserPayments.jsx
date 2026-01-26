import { Download, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FileDownloadButton from "../../components/common/FileDownloadButton";
import { ListPage } from "../../components/common/ListPage";
import PageMeta from "../../components/common/PageMeta";
import { formatAmount } from "../../lib/currencyUtils";
import { formatDate } from "../../lib/dateUtils";
import { userDownloadBlob } from "../../services/api"; // make sure this is imported



const COLUMNS = [
  {
    header: "Reference ID",
    accessor: "reference_id",
    filterKey: "reference_id",
    sortable: true,
  },
  {
    header: "Proof",
    accessor: "proof",
    sortable: false,
    render: (row) => (
      <FileDownloadButton
        file={row.proof}
        id={row.id}
        endpoint="user/payments"
        path="download"
        isUserAPI={true}
        onClick={(e) => e.stopPropagation()}
      />
    ),
  },
  {
    header: "Payment Date",
    accessor: "payment_date",
    filterKey: "payment_date",
    filterType: "date-range",
    sortable: true,
    render: (row) => formatDate(row.payment_date),
  },
  
  
  { header: "Outstanding", accessor: "outstanding", filterKey: "outstanding", sortable: true, render: (row) => formatAmount(row.outstanding) },
  {
    header: "Created At",
    accessor: "created_at",
    filterKey: "uploaded",
    filterType: "date-range",
    render: (row) => formatDate(row.created_at),
  },
  { header: "Amount", accessor: "amount", filterKey: "amount", sortable: true, render: (row) => formatAmount(row.amount) },
  
  
  {
    header: "Status",
    accessor: "status",
    disableFilter: true,
    sortable: true,
    render: (row) => {
      const label =
        row.status === 0
          ? "Pending"
          : row.status === 1
            ? "Approved"
            : "Rejected";
      const cls =
        row.status === 0
          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
          : row.status === 1
            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}
        >
          {label}
        </span>
      );
    },
  },
  
];

export default function UserPayments() {
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleBulkDownload = async () => {
    if (selectedIds.length === 0) {
      alert("Please select at least one payment");
      return;
    }

    setIsDownloading(true);
    try {
      const blob = await userDownloadBlob(`/user/payments/bulk-download`, {
        ids: selectedIds,
      });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `payments-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      setSelectedIds([]);
    } catch (err) {
      console.error("Bulk download failed:", err);
      alert("Failed to download files. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };



  return (
    <div>
      <PageMeta
        title="Payments - BMI Invoice Management System"
        description="View and manage your payment records."
      />
      <ListPage
        resourceName="user/payments"
        columns={COLUMNS}
        title="My Payments"
        subtitle="View and manage your payment records"
        showActions={false}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}

       headerAction={
  <>
    {selectedIds.length > 0 && (
      <button
        onClick={handleBulkDownload}
        disabled={isDownloading}
        className="inline-flex items-center gap-2 bg-brand-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isDownloading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        {isDownloading
          ? "Downloading..."
          : `Download (${selectedIds.length})`}
      </button>
    )}

    <button
      onClick={() => navigate("/user/payments/add")}
      className="inline-flex items-center gap-2 bg-brand-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-600 transition-colors"
    >
      <Plus className="w-4 h-4" />
      Add Payment
    </button>
  </>
}

      />
    </div>
  );
}
