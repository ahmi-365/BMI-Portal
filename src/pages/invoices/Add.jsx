import { ResourceForm } from "../../components/common/ResourceForm";

const FORM_FIELDS = [
  {
    name: "customerNo",
    label: "Customer No.",
    type: "text",
    required: true,
  },
  {
    name: "companyName",
    label: "Company Name",
    type: "text",
    required: true,
  },
  {
    name: "invoiceNo",
    label: "Invoice No.",
    type: "text",
    required: true,
  },
  {
    name: "invoiceDoc",
    label: "Invoice Document",
    type: "file",
    required: true,
  },
  {
    name: "invoiceDate",
    label: "Invoice Date",
    type: "date",
    required: true,
  },
  {
    name: "poNo",
    label: "PO No.",
    type: "text",
  },
  {
    name: "doNo",
    label: "DO No.",
    type: "text",
  },
  {
    name: "amount",
    label: "Amount",
    type: "number",
    required: true,
  },
  {
    name: "outstanding",
    label: "Outstanding",
    type: "number",
  },
  {
    name: "dueDate",
    label: "Due Date",
    type: "date",
  },
];

export default function InvoicesAdd() {
  return (
    <ResourceForm
      resourceName="invoices"
      fields={FORM_FIELDS}
      title="New Invoice"
    />
  );
}
