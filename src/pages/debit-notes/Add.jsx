import { ResourceForm } from "../../components/common/ResourceForm";

const FIELDS = [
  { name: "customerNo", label: "Customer No.", type: "text", required: true },
  { name: "companyName", label: "Company Name", type: "text", required: true },
  { name: "dnNo", label: "DN No.", type: "text", required: true },
  { name: "dnDoc", label: "DN Document", type: "file", required: true },
  { name: "dnDate", label: "DN Date", type: "date", required: true },
  { name: "poNo", label: "PO No.", type: "text" },
  { name: "refNo", label: "Ref No.", type: "text" },
  { name: "amount", label: "Amount", type: "number", required: true },
];

export default function DebitNotesAdd() {
  return (
    <ResourceForm
      resourceName="debit-notes"
      fields={FIELDS}
      title="New Debit Note"
      mode="add"
    />
  );
}
