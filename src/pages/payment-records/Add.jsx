import { ResourceForm } from "../../components/common/ResourceForm";
import { paymentsAPI } from "../../services/api";

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
    name: "invoice_id",
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
    label: "File",
    type: "file",
  },
];

export default function PaymentRecordsAdd() {
  const handleSubmit = async (formData) => {
    return await paymentsAPI.approve(formData);
  };

  return (
    <ResourceForm
      resourceName="payments"
      fields={FORM_FIELDS}
      title="Payment Record"
      onSubmit={handleSubmit}
    />
  );
}
