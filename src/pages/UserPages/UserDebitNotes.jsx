import { Download, Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import { useState } from "react";
import FileDownloadButton from "../../components/common/FileDownloadButton";
import { ListPage } from "../../components/common/ListPage";
import PageMeta from "../../components/common/PageMeta";
import { formatAmount } from "../../lib/currencyUtils";
import { formatDate } from "../../lib/dateUtils";
import { userDownloadBlob } from "../../services/api";


const COLUMNS = [
  {
    header: "Customer No.",
    accessor: "customer_no",
    filterKey: "customer_no",
    sortable: true,
  },
  { header: "Debit Note No.", accessor: "dn_no", filterKey: "dn_no", sortable: true },
  {
    header: "DN Doc",
    accessor: "dn_doc",
    filterKey: "dn_doc",
    sortable: false,
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
    sortable: true,
    render: (row) => formatDate(row.dn_date),
  },
  {
    header: "Payment Term",
    accessor: "payment_term",
    filterKey: "payment_term",
    filterType: "date-range",
    sortable: true,
    render: (row) => formatDate(row.payment_term),
  },
  
  { header: "PO No.", accessor: "po_no", filterKey: "po_no", sortable: true },
  { header: "Ref No.", accessor: "ref_no", filterKey: "ref_no", sortable: true },
  {
    header: "Amount",
    accessor: "amount",
    filterKey: "amount",
    sortable: true,
    render: (row) => formatAmount(row.amount),
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
    render: (row) => formatDate(row.created_at),
  },
];

export default function UserDebitNotes() {
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);

  const handleBulkDownload = async (type = "zip") => {
    if (selectedIds.length === 0) {
      alert("Please select at least one debit note");
      return;
    }

    setIsDownloading(true);
    try {
      const endpoint =
        type === "zip" ? `/user/debit-notes/bulk-download` : `/user/debit-notes/export`;
      const blob = await userDownloadBlob(endpoint, {
        ids: selectedIds,
      });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `debit-notes-${new Date().getTime()}.${
        type === "zip" ? "zip" : "xlsx"
      }`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      setSelectedIds([]);
    } catch (err) {
      console.error("Bulk download failed:", err);
      // replicate FileDownloadButton parsing
      let backendMessage = "";
      try {
        let errorData = err?.response?.data || err?.data;
        if (errorData instanceof Blob) {
          const text = await errorData.text();
          errorData = text;
        }
        if (typeof errorData === "string") {
          try {
            errorData = JSON.parse(errorData);
          } catch {
            const match = errorData.match(/"message"\s*:\s*"([^"]*)"/);
            if (match) {
              backendMessage = match[1];
            } else {
              backendMessage = errorData;
            }
          }
        }
        if (typeof errorData === "object" && errorData !== null) {
          backendMessage = errorData.message || "";
        }
      } catch (e) {
        console.warn("Failed to parse backend error", e);
      }
      Swal.fire({
        icon: "error",
        title: backendMessage || "No files found for selected debit notes.",
        toast: true,
        position: "top-end",
        timer: 3000,
        showConfirmButton: false,
      });
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
            <div className="relative">
              <button
                onClick={() => setIsDownloadMenuOpen(!isDownloadMenuOpen)}
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
                <svg
                  className={`w-4 h-4 ml-1 transition-transform duration-300 ${
                    isDownloadMenuOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isDownloadMenuOpen && (
                <ul className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-20 divide-y divide-gray-100">
                  <li>
                    <button
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                      onClick={() => {
                        setIsDownloadMenuOpen(false);
                        handleBulkDownload("zip");
                      }}
                    >
                      Download ZIP
                    </button>
                  </li>
                  <li>
                    <button
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                      onClick={() => {
                        setIsDownloadMenuOpen(false);
                        handleBulkDownload("excel");
                      }}
                    >
                      Download Excel
                    </button>
                  </li>
                </ul>
              )}
            </div>
          ) : null
        }
      />
    </div>
  );
}
