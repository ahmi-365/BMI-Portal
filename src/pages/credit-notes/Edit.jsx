import { ResourceForm } from "../../components/common/ResourceForm";

const FIELDS = [
  { name: "customer_no", label: "Customer No.", type: "text", required: true },
  { name: "company", label: "Company Name", type: "text" },
  { name: "cn_no", label: "CN No.", type: "text", required: true },
  { name: "do_no", label: "DO No.", type: "text" },
  { name: "cn_doc", label: "CN Document", type: "file" },
  { name: "cn_date", label: "CN Date", type: "date", required: true },
  { name: "po_no", label: "PO No.", type: "text" },
  { name: "ref_no", label: "Ref No.", type: "text" },
  { name: "amount", label: "Amount", type: "number", required: true },
];

export default function CreditNotesEdit() {
  return (
    <ResourceForm
      resourceName="creditnotes" 
      fields={FIELDS}
      title="Edit Credit Note"
      mode="edit"
    />
  );
}
