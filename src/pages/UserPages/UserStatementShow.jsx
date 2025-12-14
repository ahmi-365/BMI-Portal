import { ShowPage } from "../../components/common/ShowPage";
import { userStatementsAPI } from "../../services/api";
import FileDownloadButton from "../../components/common/FileDownloadButton";

const FIELDS = [
  { name: "id", label: "ID" },
  {
    name: "customer_no",
    label: "Customer No.",
    render: (value) => value || "-",
  },
  {
    name: "statement_doc",
    label: "Statement Document",
    render: (_value, row) => (
      <FileDownloadButton
        file={row.statement_doc}
        id={row.id}
        endpoint="user/statements"
        path="download"
        isUserAPI={true}
      />
    ),
  },
  {
    name: "statement_date",
    label: "Statement Date",
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

export default function UserStatementShow() {
  return (
    <ShowPage
      resourceName="user/statements"
      fields={FIELDS}
      title="Statement Details"
      showEdit={false}
      backPath="/user/statements"
      apiCall={userStatementsAPI.show}
    />
  );
}
