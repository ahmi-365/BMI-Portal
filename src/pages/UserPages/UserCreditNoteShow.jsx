import { ShowPage } from "../../components/common/ShowPage";
import { userCreditNotesAPI } from "../../services/api";
import FileDownloadButton from "../../components/common/FileDownloadButton";

const FIELDS = [
  { name: "id", label: "ID" },
  {
    name: "cn_no",
    label: "Credit Note No.",
    render: (value) => value || "-",
  },
  {
    name: "cn_doc",
    label: "CN Document",
    render: (_value, row) => (
      <FileDownloadButton
        file={row.cn_doc}
        id={row.id}
        endpoint="user/credit-notes"
        path="download"
        isUserAPI={true}
      />
    ),
  },
  {
    name: "cn_date",
    label: "CN Date",
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
    name: "payment_term",
    label: "Payment Term",
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
    name: "customer_no",
    label: "Customer No.",
    render: (value) => value || "-",
  },
  {
    name: "po_no",
    label: "PO No.",
    render: (value) => value || "-",
  },
  {
    name: "ref_no",
    label: "Reference No.",
    render: (value) => value || "-",
  },
  {
    name: "amount",
    label: "Amount",
    render: (value) => value || "0",
  },
  {
    name: "remarks",
    label: "Remarks",
    render: (value) => value || "-",
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

export default function UserCreditNoteShow() {
  return (
    <ShowPage
      resourceName="user/credit-notes"
      fields={FIELDS}
      title="Credit Note Details"
      showEdit={false}
      backPath="/user/credit-notes"
      apiCall={userCreditNotesAPI.show}
    />
  );
}
