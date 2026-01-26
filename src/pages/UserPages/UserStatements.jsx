import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { ListPage } from "../../components/common/ListPage";
import PageMeta from "../../components/common/PageMeta";
import FileDownloadButton from "../../components/common/FileDownloadButton";
import { userDownloadBlob } from "../../services/api";
import { formatDate } from "../../lib/dateUtils";


const COLUMNS = [
  {
    header: "Statement Doc",
    accessor: "statement_doc",
    render: (row) => (
      <FileDownloadButton
        file={row.statement_doc}
        id={row.id}
        endpoint="user/statements"
        path="download"
        isUserAPI={true}
        onClick={(e) => e.stopPropagation()}
      />
    ),
  },
  {
    header: "Statement Date",
    accessor: "statement_date",
    filterKey: "statement_date",
    filterType: "date-range",
    render: (row) => formatDate(row.statement_date),
  },
  { header: "Customer No.", accessor: "customer_no" },
  // { header: "Remarks", accessor: "remarks", filterKey: "remarks" },
  {
    header: "Created At",
    accessor: "created_at",
    filterKey: "uploaded",
    filterType: "date-range",
    render: (row) => formatDate(row.created_at),
  },
];

export default function UserStatements() {
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleBulkDownload = async () => {
    if (selectedIds.length === 0) {
      alert("Please select at least one statement");
      return;
    }

    setIsDownloading(true);
    try {
      const blob = await userDownloadBlob(`/user/statements/bulk-download`, {
        ids: selectedIds,
      });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = "account-statements.zip";
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
        title="Account Statements - BMI Invoice Management System"
        description="View your account statements and financial records."
      />
      <ListPage
        resourceName="user/statements"
        columns={COLUMNS}
        title="My Account Statements"
        subtitle="View your financial statements and records"
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
