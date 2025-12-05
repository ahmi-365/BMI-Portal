import { ResourceForm } from "../../components/common/ResourceForm";
import { debitNotesAPI } from "../../services/api";

const FIELDS = [
  { name: "user_id", label: "User ID", type: "number", required: true },
  { name: "date", label: "Date", type: "date", required: true },
  { name: "invoiceId", label: "Invoice ID", type: "text", required: true },
  { name: "customer_no", label: "Customer No.", type: "text", required: true },
  { name: "amount", label: "Amount", type: "number", required: true },
  { name: "do_no", label: "DO No.", type: "text" },
  { name: "remarks", label: "Remarks", type: "textarea" },
  { name: "po_no", label: "PO No.", type: "text" },
  { name: "do_doc", label: "DO Document", type: "file" },
  { name: "file", label: "File", type: "file" },
];

export default function DebitNotesAdd() {
  const handleSubmit = async (formData) => {
    return await debitNotesAPI.create(formData);
  };

  return (
    <ResourceForm
      resourceName="debit-notes"
      fields={FIELDS}
      title="New Debit Note"
      mode="add"
      onSubmit={handleSubmit}
    />
  );
}
