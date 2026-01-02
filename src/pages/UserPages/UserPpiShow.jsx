import { ShowPage } from "../../components/common/ShowPage";
import { userPpisAPI } from "../../services/api";
import FileDownloadButton from "../../components/common/FileDownloadButton";

const FIELDS = [
  { name: "id", label: "ID" },
  {
    name: "user.company",
    label: "Company",
    render: (_value, row) => row.user?.company || "-",
  },
  {
    name: "ppi_date",
    label: "PPI Date",
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
    label: "Ref No.",
    render: (value) => value || "-",
  },
  {
    name: "amount",
    label: "Amount",
    render: (value) => value || "0",
  },
  {
    name: "ppi_percentage",
    label: "PPI %",
    render: (value) => value || "-",
  },
  {
    name: "ppi_doc",
    label: "PPI Document",
    render: (_value, row) => (
      <FileDownloadButton
        file={row.ppi_doc}
        id={row.id}
        endpoint="user/ppis"
        path="download"
        isUserAPI={true}
      />
    ),
  },
  {
    name: "remarks",
    label: "Remarks",
    render: (value) => value || "-",
  },
  {
    name: "created_at",
    label: "Uploaded At",
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
    name: "admin_id",
    label: "Uploaded By",
    render: (_value, row) => row.admin?.name || "-",
  },
];

export default function UserPpiShow() {
  return (
    <ShowPage
      resourceName="user/ppis"
      fields={FIELDS}
      title="PPI Details"
      showEdit={false}
      backPath="/user/ppi"
      apiCall={userPpisAPI.show}
    />
  );
}
