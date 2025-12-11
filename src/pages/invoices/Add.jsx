import { ResourceForm } from "../../components/common/ResourceForm";
import { invoicesAPI } from "../../services/api";

const FORM_FIELDS = [
  {
    name: "companyName",
    label: "Company Name",
    type: "text",
  },
  {
    name: "customerNo",
    label: "Customer No.",
    type: "text",
    required: true,
  },
  {
    name: "poNo",
    label: "Customer PO No.",
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
    name: "doNo",
    label: "Delivery Order No. (Can add multiple comma separated DO No's)",
    type: "text",
    placeholder: "DO123, DO124",
  },
  {
    name: "invoiceDate",
    label: "Invoice Date",
    type: "date",
    required: true,
  },
  {
    name: "dueDate",
    label: "Due Date",
    type: "date",
    required: true,
  },
  {
    name: "invoiceDoc",
    label: "Invoice Document",
    type: "file",
    required: true,
  },
  {
    name: "amount",
    label: "Amount (MYR)",
    type: "number",
    required: true,
  },
  {
    name: "remarks",
    label: "Remarks",
    type: "textarea",
  },
];

export default function InvoicesAdd() {
  const handleSubmit = async (formData) => {
    return await invoicesAPI.create(formData);
  };

  return (
    <ResourceForm
      resourceName="invoices"
      fields={FORM_FIELDS}
      title="New Invoice"
      onSubmit={handleSubmit}
    />
  );
}
