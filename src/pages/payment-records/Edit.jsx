import { ResourceForm } from "../../components/common/ResourceForm";

const FORM_FIELDS = [
  {
    name: "name",
    label: "Record Name",
    type: "text",
    placeholder: "Enter record name",
    required: true,
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "Enter email",
    required: true,
  },
  {
    name: "mailable",
    label: "Mailable",
    type: "checkbox",
    required: false,
  },
];

export default function PaymentRecordsEdit() {
  return (
    <ResourceForm
      resourceName="payment-records"
      fields={FORM_FIELDS}
      title="Payment Record"
    />
  );
}
