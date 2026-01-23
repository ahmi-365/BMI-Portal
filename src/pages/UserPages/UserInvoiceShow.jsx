import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FileDownloadButton from "../../components/common/FileDownloadButton";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { formatAmount } from "../../lib/currencyUtils";
import { formatDate } from "../../lib/dateUtils";
import { userInvoicesAPI } from "../../services/api";


export default function UserInvoiceShow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const result = await userInvoicesAPI.show(id);
      setData(result?.data || result);
    } catch (error) {
      console.error("Error loading invoice:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Loading details...
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="rounded-2xl bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 p-6 text-red-800 dark:from-red-900/20 dark:to-red-900/10 dark:border-red-800/50 dark:text-red-400">
          <div className="flex items-center gap-3">
            <X className="w-6 h-6" />
            <span className="font-semibold">Invoice not found</span>
          </div>
        </div>
      </div>
    );
  }

  const FIELDS = [
    { label: "ID", value: data.id },
    { label: "Invoice No.", value: data.invoiceId || data.invoice_no || "-" },
    { label: "Customer No.", value: data.customer_no || "-" },
    {
  label: "Invoice Date",
  value: formatDate(data.invoice_date),
}
,
    {
  label: "Due Date",
  value: formatDate(data.date),
}
,
    { label: "PO No.", value: data.po_no || "-" },
    { label: "DO No.", value: data.do_no || "-" },
    { label: "Amount (MYR)", value: formatAmount(data.amount) || "-" },
    { label: "Outstanding", value: formatAmount(data.outstanding) || "-" },
    {
      label: "Status",
      value:
        data.status === 0
          ? "Pending"
          : data.status === 1
          ? "Approved"
          : "Active",
    },
    { label: "Remarks", value: data.remarks || "-" },
    {
      label: "Created At",
      // value: data.created_at ? String(data.created_at).split("T")[0] : "-",
      value: formatDate(data.created_at),
    },
    {
      label: "Updated At",
      // value: data.updated_at ? String(data.updated_at).split("T")[0] : "-",
      value: formatDate(data.updated_at),
    },
    // { label: "Admin ID", value: data.admin_id || "-" },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 animate-fadeIn mt-12">
      {/* Breadcrumb Navigation */}
      <PageBreadcrumb
        pageTitle="Invoice Details"
        breadcrumbs={[
          { label: "Invoices", path: "/user/invoices" },
          { label: "View Invoice" },
        ]}
      />

      {/* Compact Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Invoice ID: {id}
          </p>
        </div>
      </div>

      {/* Clean Table Layout */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 overflow-hidden animate-slideIn">
        <div className="overflow-x-auto">
          <table className="w-full">
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {FIELDS.map((field, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/30 w-1/3">
                    {field.label}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                    {field.value}
                  </td>
                </tr>
              ))}
              {/* Invoice Document Row */}
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/30 w-1/3">
                  Invoice Document
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                  {data.invoice_doc ? (
                    <FileDownloadButton
                      file={data.invoice_doc}
                      id={data.id}
                      endpoint="user/invoices"
                      path="download"
                      isUserAPI={true}
                    />
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
              {/* DO Document Row */}
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/30 w-1/3">
                  DO Document
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                  {data.do_doc ? (
                    <FileDownloadButton
                      file={data.do_doc}
                      id={data.id}
                      endpoint="user/invoices"
                      path="download-do"
                      isUserAPI={true}
                    />
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
