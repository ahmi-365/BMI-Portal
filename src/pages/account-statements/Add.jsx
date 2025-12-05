import { ResourceForm } from "../../components/common/ResourceForm";

const FIELDS = [
  { name: "customerNo", label: "Customer No.", type: "text", required: true },
  { name: "companyName", label: "Company Name", type: "text", required: true },
  {
    name: "statementDoc",
    label: "Statement Document",
    type: "file",
    required: true,
  },
  {
    name: "statementDate",
    label: "Statement Date",
    type: "date",
    required: true,
  },
];

export default function AccountStatementsAdd() {
  return (
    <ResourceForm
      resourceName="account-statements"
      fields={FIELDS}
      title="New Account Statement"
      mode="add"
    />
  );
}
