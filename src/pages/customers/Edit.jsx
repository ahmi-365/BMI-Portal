import { ResourceForm } from "../../components/common/ResourceForm";

const FIELDS = [
  { name: "customer_no", label: "Customer No.", type: "text", required: true },
  {
    name: "company",
    label: "Company/Business Name",
    type: "text",
    required: true,
  },
  { name: "name", label: "Contact Name", type: "text", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  {
    name: "phone",
    label: "Business Contact Number",
    type: "text",
  },
  { name: "payment_term", label: "Payment Term", type: "text" },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "0", label: "Pending" },
      { value: "1", label: "Approved" },
    ],
    required: true,
  },
  { name: "cc1", label: "Upload Credit Application Form (CC1)", type: "file" },
  { name: "form_24", label: "Upload Form 24", type: "file" },
  { name: "form_9", label: "Upload Form 9", type: "file" },
  {
    name: "financial_statement",
    label: "Upload Financial Statements",
    type: "file",
  },
  { name: "pdpa", label: "Upload PDPA", type: "file" },
];

export default function CustomersEdit() {
  return (
    <ResourceForm
      resourceName="customers"
      fields={FIELDS}
      title="Edit Customer"
      mode="edit"
    />
  );
}
