import { ShowPage } from "../../components/common/ShowPage";

const FIELDS = [
  { name: "id", label: "ID" },
  { name: "customer_no", label: "Customer No." },
  { name: "user.company", label: "Company Name" },   // nested field
  { name: "cn_no", label: "CN No." },
  { name: "cn_doc", label: "CN Document" },
  { name: "cn_date", label: "CN Date" },
  { name: "po_no", label: "PO No." },
  { name: "ref_no", label: "Ref No." },
  { name: "amount", label: "Amount" },
  { name: "remarks", label: "Remarks" },
  { name: "payment_term", label: "Payment Term" },
  { name: "created_at", label: "Uploaded At" },
  { name: "admin_id", label: "Uploaded By" },
];

export default function CreditNotesShow() {
  return (
    <ShowPage
      resourceName="creditnotes"
      fields={FIELDS}
      title="Credit Note"
    />
  );
}
