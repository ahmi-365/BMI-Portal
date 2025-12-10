import { ResourceForm } from "../../components/common/ResourceForm";
import { paymentsAPI } from "../../services/api";

export const FORM_FIELDS = [
  {
    name: "user_id",
    label: "User ID",
    type: "number",
    required: true,
  },
  {
    name: "payment_date",
    label: "Payment Date",
    type: "date",
    required: true,
  },
  {
    name: "amount",
    label: "Amount",
    type: "number",
    required: true,
  },
  {
    name: "reference_id",
    label: "Reference ID",
    type: "text",
    required: true,
  },
  {
    name: "invoice_id",
    label: "Invoice ID",
    type: "text",
  },
  {
    name: "proof",
    label: "Proof Document",
    type: "file",
  },
  {
    name: "remarks",
    label: "Remarks",
    type: "textarea",
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
