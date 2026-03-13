import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import FileDownloadButton from "../../components/common/FileDownloadButton";
import { ListPage } from "../../components/common/ListPage";
import PageMeta from "../../components/common/PageMeta";
import { formatDate } from "../../lib/dateUtils";
import { userDownloadBlob } from "../../services/api";



const COLUMNS = [
  { header: "DO No.", accessor: "do_no", filterKey: "do_no" },
  {
    header: "DO Doc",
    accessor: "do_doc",
    sortable: false,

    render: (row) => (
      <FileDownloadButton
        file={row.do_doc}
        id={row.id}
        endpoint="user/delivery-orders"
        path="download"
        isUserAPI={true}
        onClick={(e) => e.stopPropagation()}
      />
    ),
  },
  
  {
    header: "Invoice Date",
    accessor: "invoice_date",
    filterKey: "date",
    filterType: "date-range",
      render: (row) => formatDate(row.invoice.invoice_date),
    
  },
  {
    header: "Invoice No.",
    accessor: "invoiceId",
    filterKey: "invoiceId",
    render: (row) => row.invoice?.invoiceId || row.customer_no || "-",

    
  },
  {
    header: "Due Date",
    accessor: "date",
    filterKey: "due_date",
    filterType: "date-range",
         render: (row) => formatDate(row.invoice.date),

  },
  // { header: "Remarks", accessor: "remarks", filterKey: "remarks" },
  {
    header: "Created At",
    accessor: "created_at",
    filterKey: "uploaded",
    filterType: "date-range",
    render: (row) => formatDate(row.created_at),
  },
];

export default function UserDeliveryOrders() {
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);

  const handleBulkDownload = async (type = "zip") => {
    if (selectedIds.length === 0) {
      alert("Please select at least one delivery order");
      return;
    }

    setIsDownloading(true);
    try {
      const endpoint =
        type === "zip"
          ? `/user/delivery-orders/bulk-download`
          : `/user/delivery-orders/export`;
      const blob = await userDownloadBlob(endpoint, {
        ids: selectedIds,
      });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `delivery-orders-${new Date().getTime()}.${
        type === "zip" ? "zip" : "xlsx"
      }`;
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
        title="Delivery Orders - BMI Invoice Management System"
        description="View your delivery orders, track status, and access associated documents."
      />
      <ListPage
        resourceName="user/delivery-orders"
        columns={COLUMNS}
        title="My Delivery Orders"
        subtitle="View and track your delivery orders"
        basePath="/user/delivery-orders"
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
