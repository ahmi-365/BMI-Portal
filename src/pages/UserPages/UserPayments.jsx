import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { ListPage } from "../../components/common/ListPage";
import PageMeta from "../../components/common/PageMeta";
import FileDownloadButton from "../../components/common/FileDownloadButton";

const COLUMNS = [
  { header: "Reference ID", accessor: "reference_id" },
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
    render: (row) => {
      if (!row.payment_date) return "-";
      return new Date(row.payment_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
  { header: "Amount", accessor: "amount" },
  { header: "Outstanding", accessor: "outstanding" },
  {
    header: "Status",
    accessor: "status",
    render: (row) => {
      return row.status === 0
        ? "Pending"
        : row.status === 1
        ? "Approved"
        : "Rejected";
    },
  },
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
