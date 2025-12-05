import { ResourceForm } from "../../components/common/ResourceForm";
import { creditNotesAPI } from "../../services/api";

const FIELDS = [
  { name: "user_id", label: "User ID", type: "number", required: true },
  { name: "cn_no", label: "CN No.", type: "text", required: true },
  { name: "customer_no", label: "Customer No.", type: "text", required: true },
  { name: "po_no", label: "PO No.", type: "text" },
  { name: "ref_no", label: "Ref No.", type: "text" },
  { name: "amount", label: "Amount", type: "number", required: true },
  { name: "cn_date", label: "CN Date", type: "date", required: true },
  { name: "payment_term", label: "Payment Term", type: "number" },
  { name: "remarks", label: "Remarks", type: "textarea" },
  { name: "do_doc", label: "DO Document", type: "file" },
  { name: "file", label: "File", type: "file" },
];

export default function CreditNotesAdd() {
  const handleSubmit = async (formData) => {
    return await creditNotesAPI.create(formData);
  };

  return (
    <ResourceForm
      resourceName="credit-notes"
      fields={FIELDS}
      title="New Credit Note"
      mode="add"
      onSubmit={handleSubmit}
    />
  );
}
