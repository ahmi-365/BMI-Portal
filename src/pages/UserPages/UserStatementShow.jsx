import { ShowPage } from "../../components/common/ShowPage";
import { userStatementsAPI } from "../../services/api";
import FileDownloadButton from "../../components/common/FileDownloadButton";
import { formatDate } from "../../lib/dateUtils";


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
    render: (value) => formatDate(value),
  },
  {
    name: "remarks",
    label: "Remarks",
    render: (value) => value || "-",
  },
  {
    name: "created_at",
    label: "Created At",
    render: (value) => formatDate(value),
  },
  {
    name: "updated_at",
    label: "Updated At",
    render: (value) => formatDate(value),
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
