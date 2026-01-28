import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import Toast from "../../components/common/Toast";
import { DateRangePicker } from "../../components/common/DateRangePicker";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { reportsAPI } from "../../services/api";
import { Download, Calendar, FileText } from "lucide-react";

const RESOURCE_OPTIONS = [
  { value: "invoice", label: "Invoices" },
  { value: "deliveryOrder", label: "Delivery Orders" },
  { value: "creditNote", label: "Credit Notes" },
  { value: "debitNote", label: "Debit Notes" },
  { value: "statement", label: "Statements" },
  { value: "payment", label: "Payments" },
];

export default function UserExportReport() {
  const [resource, setResource] = useState(RESOURCE_OPTIONS[0]?.value || "");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ message: null, type: "success" });

  const handleDateChange = (filterType, value) => {
    if (filterType === "from") {
      setDateFrom(value);
    } else if (filterType === "to") {
      setDateTo(value);
    } else if (filterType === "clear") {
      setDateFrom("");
      setDateTo("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resource) {
      setToast({ message: "Select a report type to export", type: "error" });
      return;
    }
    if (dateFrom && dateTo && dateFrom > dateTo) {
      setToast({
        message: "Start date must be before end date",
        type: "error",
      });
      return;
    }

    try {
      setIsLoading(true);
      setToast({ message: null, type: "success" });
      const payload = {
        model: resource,
      };
      
      // Only add dates if provided (no type or user_ids sent for user bulk download)
      if (dateFrom) payload.date_from = dateFrom;
      if (dateTo) payload.date_to = dateTo;
      
      const blob = await reportsAPI.UserbulkDownload(payload);
      const filename = `report-${resource}-${new Date().getTime()}.zip`;
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      setToast({ message: "Report export started successfully", type: "success" });
    } catch (error) {
      setToast({
        message: error.message || "Failed to export report",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen mt-12">
      <div className="mx-auto max-w-4xl space-y-8">
        {toast.message && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ message: null, type: "success" })}
          />
        )}
        <PageMeta
          title="Export Report"
          description="Download your documents and records."
        />

        {/* Breadcrumb */}
        <PageBreadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Export Report", href: "/user/export-report" },
          ]}
        />

        {/* Header */}
        <div className="flex items-center gap-3">
          <Download className="w-6 h-6 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Export Report
            </h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Configure parameters to download your report archive.
            </p>
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Report Type Section */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/80 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              Report Type
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {RESOURCE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setResource(option.value)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 border ${
                    resource === option.value
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-md"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-600"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Export Format Section (ZIP only) */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/80 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-500" />
              Export Format
            </h2>
            <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">ZIP Format</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Compressed archive format for easy download and sharing
                </p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs font-medium text-green-700 dark:text-green-300">Selected</span>
              </div>
            </div>
          </div>

          {/* Date Range Section */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/80 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Time Period
              <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                (Optional - Max 30 days)
              </span>
            </h2>
            <DateRangePicker
              dateFrom={dateFrom}
              dateTo={dateTo}
              onDateChange={handleDateChange}
              rangeRestriction="month"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 py-3 px-6 text-base font-bold text-white transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="animate-pulse">Processing...</span>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Download Report Archive
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
