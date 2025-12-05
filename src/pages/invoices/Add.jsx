import { ResourceForm } from "../../components/common/ResourceForm";
import { invoicesAPI } from "../../services/api";

const FORM_FIELDS = [
  {
    name: "user_id",
    label: "User ID",
    type: "number",
    required: true,
  },
  {
    name: "date",
    label: "Date",
    type: "date",
    required: true,
  },
  {
    name: "invoiceId",
    label: "Invoice ID",
    type: "text",
    required: true,
  },
  {
    name: "customer_no",
    label: "Customer No.",
    type: "text",
    required: true,
  },
  {
    name: "amount",
    label: "Amount",
    type: "number",
    required: true,
  },
  {
    name: "do_no",
    label: "DO No.",
    type: "text",
  },
  {
    name: "remarks",
    label: "Remarks",
    type: "textarea",
  },
  {
    name: "po_no",
    label: "PO No.",
    type: "text",
  },
  {
    name: "do_doc",
    label: "DO Document",
    type: "file",
  },
  {
    name: "file",
    label: "Invoice File",
    type: "file",
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
