import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { ListPage } from "../../components/common/ListPage";
import PageMeta from "../../components/common/PageMeta";
import FileDownloadButton from "../../components/common/FileDownloadButton";
import { userDownloadBlob } from "../../services/api";

const COLUMNS = [
  { header: "Debit Note No.", accessor: "dn_no", filterKey: "dn_no" },
  {
    header: "DN Doc",
    accessor: "dn_doc",
    filterKey: "dn_doc",
    render: (row) => (
      <FileDownloadButton
        file={row.dn_doc}
        id={row.id}
        endpoint="user/debit-notes"
        path="download"
        isUserAPI={true}
      />
    ),
  },
  {
    header: "DN Date",
    accessor: "dn_date",
    filterKey: "dn_date",
    filterType: "date-range",
    render: (row) => {
      if (!row.dn_date) return "-";
      return new Date(row.dn_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
  {
    header: "Payment Term",
    accessor: "payment_term",
    filterKey: "payment_term",
    filterType: "date-range",
    render: (row) => {
      if (!row.payment_term) return "-";
      return new Date(row.payment_term).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
  {
    header: "Customer No.",
    accessor: "customer_no",
    filterKey: "customer_no",
  },
  { header: "PO No.", accessor: "po_no", filterKey: "po_no" },
  { header: "Ref No.", accessor: "ref_no", filterKey: "ref_no" },
  {
    header: "Amount",
    accessor: "amount",
    filterKey: "amount",
  },
  // {
  //   header: "Remarks",
  //   accessor: "remarks",
  //   filterKey: "remarks",
  // },
  {
    header: "Created At",
    accessor: "created_at",
    filterKey: "uploaded",
    filterType: "date-range",
    render: (row) => {
      if (!row.created_at) return "-";
      return new Date(row.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
];

export default function UserDebitNotes() {
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleBulkDownload = async () => {
    if (selectedIds.length === 0) {
      alert("Please select at least one debit note");
      return;
    }

    setIsDownloading(true);
    try {
      const blob = await userDownloadBlob(`/user/debit-notes/bulk-download`, {
        ids: selectedIds,
      });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = "debit-notes.zip";
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
        title="Debit Notes - BMI Invoice Management System"
        description="View your debit notes, track status, and access associated documents."
      />
      <ListPage
        resourceName="user/debit-notes"
        columns={COLUMNS}
        title="My Debit Notes"
        subtitle="View and track your debit notes"
        showActions={false}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        headerAction={
          selectedIds.length > 0 ? (
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
          ) : null
        }
      />
    </div>
  );
}
