import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { ListPage } from "../../components/common/ListPage";
import PageMeta from "../../components/common/PageMeta";
import FileDownloadButton from "../../components/common/FileDownloadButton";

const COLUMNS = [
  {
    header: "Reference ID",
    accessor: "reference_id",
    filterKey: "reference_id",
  },
  {
    header: "Proof",
    accessor: "proof",
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
    render: (row) => {
      if (!row.payment_date) return "-";
      return new Date(row.payment_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
  { header: "Amount", accessor: "amount", filterKey: "amount" },
  { header: "Outstanding", accessor: "outstanding", filterKey: "outstanding" },
  {
    header: "Status",
    accessor: "status",
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
  {
    header: "Created At",
    accessor: "created_at",
    filterKey: "uploaded_at",
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

export default function UserPayments() {
  const navigate = useNavigate();

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
        headerAction={
          <button
            onClick={() => navigate("/user/payments/add")}
            className="inline-flex items-center gap-2 bg-brand-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Payment
          </button>
        }
      />
    </div>
  );
}
