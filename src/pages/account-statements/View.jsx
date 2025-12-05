import { ListPage } from "../../components/common/ListPage";
import PageMeta from "../../components/common/PageMeta";

const COLUMNS = [
  { header: "Customer No.", accessor: "customerNo" },
  { header: "Company Name", accessor: "companyName" },
  { header: "Statement Doc", accessor: "statementDoc" },
  { header: "Statement Date", accessor: "statementDate" },
  { header: "Uploaded at", accessor: "uploadedAt" },
  { header: "Uploaded By", accessor: "uploadedBy" },
];

export default function AccountStatementsView() {
  return (
    <ListPage
      resourceName="account-statements"
      columns={COLUMNS}
      title="Account Statements"
      addButtonText="New Account Statement"
    />
  );
}
