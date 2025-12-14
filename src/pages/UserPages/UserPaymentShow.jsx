import { ShowPage } from "../../components/common/ShowPage";
import { userPaymentsAPI } from "../../services/api";
import FileDownloadButton from "../../components/common/FileDownloadButton";

const FIELDS = [
  { name: "id", label: "ID" },
  {
    name: "reference_id",
    label: "Reference ID",
    render: (value) => value || "-",
  },
  {
    name: "proof",
    label: "Payment Proof",
    render: (_value, row) => (
      <FileDownloadButton
        file={row.proof}
        id={row.id}
        endpoint="user/payments"
        path="download"
        isUserAPI={true}
      />
    ),
  },
  {
    name: "payment_date",
    label: "Payment Date",
    render: (value) => {
      if (!value) return "-";
      return new Date(value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
  {
    name: "amount",
    label: "Amount",
    render: (value) => value || "0",
  },
  {
    name: "outstanding",
    label: "Outstanding",
    render: (value) => value || "0",
  },
  {
    name: "status",
    label: "Status",
    render: (value) => {
      if (value === 0) return "Pending";
      if (value === 1) return "Approved";
      return "Rejected";
    },
  },
  {
    name: "created_at",
    label: "Created At",
    render: (value) => {
      if (!value) return "-";
      return new Date(value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },
  {
    name: "updated_at",
    label: "Updated At",
    render: (value) => {
      if (!value) return "-";
      return new Date(value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },
];

export default function UserPaymentShow() {
  const customApiCall = async (id) => {
    const result = await userPaymentsAPI.show(id);
    return result?.data?.payment || result?.payment || result;
  };

  return (
    <ShowPage
      resourceName="user/payments"
      fields={FIELDS}
      title="Payment Details"
      showEdit={false}
      backPath="/user/payments"
      apiCall={customApiCall}
    />
  );
}
