import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { ListPage } from "../../components/common/ListPage";
import PageMeta from "../../components/common/PageMeta";
import FileDownloadButton from "../../components/common/FileDownloadButton";
import { userDownloadBlob } from "../../services/api";

const COLUMNS = [
  { header: "	PPI No.", accessor: "cn_no", filterKey: "cn_no" },
  {
    header: "Company",
    accessor: "cn_doc",
    render: (row) => (
      <FileDownloadButton
        file={row.cn_doc}
        id={row.id}
        endpoint="user/credit-notes"
        path="download"
        isUserAPI={true}
        onClick={(e) => e.stopPropagation()}
      />
    ),
  },
  {
    header: "Customer No.",
    accessor: "cn_date",
    filterKey: "cn_date",
    filterType: "date-range",
    render: (row) => {
      if (!row.cn_date) return "-";
      return new Date(row.cn_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
  {
    header: "PO No.",
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
    header: "Ref No.",
    accessor: "customer_no",
    filterKey: "customer_no",
  },
  { header: "Amount", accessor: "po_no", filterKey: "po_no" },
  { header: "PPI Date", accessor: "ref_no", filterKey: "ref_no" },
  {
    header: "Payment Term",
    accessor: "amount",
    filterKey: "amount",
  },
  {
    header: "PPI %",
    accessor: "remarks",
    filterKey: "remarks",
  },
  {
    header: "PPI Doc",
    accessor: "created_at",
    filterKey: "created_at",
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
   {
    header: "Uploaded By",
    accessor: "remarks",
    filterKey: "remarks",
  },
   {
    header: "Created At",
    accessor: "remarks",
    filterKey: "remarks",
  },
   {
    header: "Actions",
    accessor: "remarks",
    filterKey: "remarks",
  },
];

export default function UserPPIs() {
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleBulkDownload = async () => {
    if (selectedIds.length === 0) {
      alert("Please select at least one credit note");
      return;
    }

    setIsDownloading(true);
    try {
      const blob = await userDownloadBlob(`/user/credit-notes/bulk-download`, {
        ids: selectedIds,
      });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = "credit-notes.zip";
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
        title="Credit Notes - BMI Invoice Management System"
        description="View your credit notes, track status, and access associated documents."
      />
      <ListPage
        resourceName="user/credit-notes"
        columns={COLUMNS}
        title="My Credit Notes"
        subtitle="View and track your credit notes"
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
