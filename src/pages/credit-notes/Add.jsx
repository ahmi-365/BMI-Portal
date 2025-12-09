import { ResourceForm } from "../../components/common/ResourceForm";
import { creditNotesAPI } from "../../services/api";

const FIELDS = [
  { name: "user_id", label: "Company Name", type: "number", required: true },
  { name: "cn_no", label: "Customer No.", type: "text", required: true },
  { name: "customer_no", label: "Customer PO No.", type: "text", required: true },
  { name: "po_no", label: "Amount (MYR)", type: "text" },
  { name: "ref_no", label: "CN No.", type: "text" },
  { name: "amount", label: "Reference No.", type: "number", required: true },
  { name: "cn_date", label: "CN Document", type: "date", required: true },
  { name: "payment_term", label: "CN Date", type: "number" },
  { name: "remarks", label: "Due Date", type: "textarea" },
  { name: "do_doc", label: "Remarks", type: "file" },
  // { name: "file", label: "File", type: "file" },
];

export default function CreditNotesAdd() {
  const handleSubmit = async (formData) => {
    return await creditNotesAPI.create(formData);
  };

  return (
    <ResourceForm
      resourceName="creditnotes"
      fields={FIELDS}
      title="New Credit Note"
      mode="add"
      onSubmit={handleSubmit}
    />
  );
}
