import { ShowPage } from "../../components/common/ShowPage";

const FIELDS = [
  { name: "id", label: "ID" },
  { name: "customer_no", label: "Customer No" },
  {
    name: "user",
    label: "Company Name",
    render: (user) => user?.company || "-",
  },
  { name: "statement_doc", label: "Statement Document", type: "file" },
  { name: "statement_date", label: "Statement Date" },
  { name: "updated_at", label: "Updated At" },
  {
    name: "user",
    label: "Uploaded By",
    render: (user, data) => data.admin?.name || user?.name || "-",
  },
];

export default function AccountStatementsShow() {
  return (
    <ShowPage
      resourceName="statements"
      fields={FIELDS}
      title="Account Statement"
    />
  );
}
