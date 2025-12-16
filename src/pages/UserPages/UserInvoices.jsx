import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { ListPage } from "../../components/common/ListPage";
import PageMeta from "../../components/common/PageMeta";
import FileDownloadButton from "../../components/common/FileDownloadButton";
import { userDownloadBlob } from "../../services/api";

const COLUMNS = [
  { header: "Invoice No.", accessor: "invoiceId" },
  {
    header: "Invoice Doc",
    accessor: "invoice_doc",
    render: (row) => (
      <FileDownloadButton
        file={row.invoice_doc}
        id={row.id}
        endpoint="user/invoices"
        path="download"
        isUserAPI={true}
        onClick={(e) => e.stopPropagation()}
      />
    ),
  },
  {
    header: "Invoice Date",
    accessor: "invoice_date",
    render: (row) => {
      if (!row.invoice_date) return "-";
      return new Date(row.invoice_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
  { header: "Customer No.", accessor: "customer_no" },
  { header: "PO No.", accessor: "po_no" },
  { header: "DO No.", accessor: "do_no" },
  { header: "Amount", accessor: "amount" },
  { header: "Remarks", accessor: "remarks" },
  {
    header: "Created At",
    accessor: "created_at",
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

export default function UserInvoices() {
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleBulkDownload = async () => {
    if (selectedIds.length === 0) {
      alert("Please select at least one invoice");
      return;
    }

    setIsDownloading(true);
    try {
      const blob = await userDownloadBlob(`/user/invoices/bulk-download`, {
        ids: selectedIds,
      });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = "invoices.zip";
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
        title="Invoices - BMI Invoice Management System"
        description="View your invoices, track payment status, and access associated documents."
      />
      <ListPage
        resourceName="user/invoices"
        columns={COLUMNS}
        title="My Invoices"
        subtitle="View and track your invoices"
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
