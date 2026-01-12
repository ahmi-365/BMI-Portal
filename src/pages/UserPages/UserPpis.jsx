import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { ListPage } from "../../components/common/ListPage";
import PageMeta from "../../components/common/PageMeta";
import FileDownloadButton from "../../components/common/FileDownloadButton";
import { userDownloadBlob } from "../../services/api";
import { render } from "@fullcalendar/core/preact.js";
import { openBulkConfirm } from "../../components/common/bulkConfirmManager";
import { formatDate } from "../../lib/dateUtils";



const COLUMNS = [
  {
    header: "Company",
    accessor: "user.company",
    filterKey: "company",
    render: (row) => row.user?.company || "-",
  },
  {
    header: "Customer No.",
    accessor: "customer_no",
    filterKey: "customer_no",
  },
  {
    header: "PO No.",
    accessor: "po_no",
    filterKey: "po_no",
  },
  {
    header: "Ref No.",
    accessor: "ref_no",
    filterKey: "ref_no",
  },
  { header: "Amount", accessor: "amount", filterKey: "amount" },
  {
    header: "PPI Date", accessor: "ppi_date", filterKey: "ppi_date",
    filterType: "date-range",
    render: (row) => formatDate(row.ppi_date),
  },
  {
    header: "Payment Term",
    accessor: "payment_term",
    filterKey: "payment_term",
    filterType: "date-range",
    render: (row) => formatDate(row.payment_term),
  },
  {
    header: "PPI %",
    accessor: "ppi_percentage",
    filterKey: "ppi_percentage",
  },
  {
    header: "PPI Doc",
    accessor: "ppi_doc",
    filterKey: "ppi_doc",
    render: (row) => (
      <FileDownloadButton
        file={row.ppi_doc}
        id={row.id}
        endpoint="user/ppis"
        path="download"
      />
    ),
  },
  // {
  //   header: "Uploaded By",
  //   accessor: "uploaded_by",
  //   filterKey: "Uploaded_by",
  // },
  {
    header: "Created At",
    accessor: "created_at",
    filterKey: "uploaded",
    filterType: "date-range",
    render: (row) => formatDate(row.created_at),
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
      const blob = await userDownloadBlob(`/user/ppis/bulk-download`, {
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
  const handleBulkDownloadWithConfirm = () => {
    if (selectedIds.length === 0) {
      alert("Please select at least one PPI");
      return;
    }

    openBulkConfirm({
      type: "zip",
      title: "Download ZIP",
      message: `Are you sure you want to download ${selectedIds.length} PPI(s)?`,
      confirmText: "Yes, Download",
      onConfirm: async () => {
        setIsDownloading(true);
        try {
          const blob = await userDownloadBlob(`/user/ppis/bulk-download`, {
            ids: selectedIds,
          });
          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = blobUrl;
          a.download = "ppis.zip"; // Use a proper name
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
      },
    });
  };


  return (
    <div>
      <PageMeta
        title="Credit Notes - BMI Invoice Management System"
        description="View your credit notes, track status, and access associated documents."
      />
      <ListPage
        resourceName="user/ppis"
        columns={COLUMNS}
        title="PPI"
        subtitle="View and track your PPIs"
        showActions={false}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        headerAction={
          selectedIds.length > 0 ? (
            <button
              onClick={handleBulkDownloadWithConfirm}
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
