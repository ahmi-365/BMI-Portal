import { ResourceForm } from "../../components/common/ResourceForm";

const FIELDS = [
  { name: "customerNo", label: "Customer No.", type: "text", required: true },
  { name: "companyName", label: "Company Name", type: "text", required: true },
  { name: "cnNo", label: "CN No.", type: "text", required: true },
  { name: "doNo", label: "DO No.", type: "text", required: true },
  { name: "cnDoc", label: "CN Document", type: "file", required: true },
  { name: "doDoc", label: "DO Document", type: "file", required: true },
  { name: "cnDate", label: "CN Date", type: "date", required: true },
  { name: "poNo", label: "PO No.", type: "text" },
  { name: "refNo", label: "Ref No.", type: "text" },
  { name: "amount", label: "Amount", type: "number", required: true },
];

export default function CreditNotesAdd() {
  return (
    <ResourceForm
      resourceName="credit-notes"
      fields={FIELDS}
      title="New Credit Note"
      mode="add"
    />
  );
}
