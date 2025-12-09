import { ShowPage } from "../../components/common/ShowPage";

const FIELDS = [
  { name: "id", label: "ID" },
  { name: "customer_no", label: "Customer No." },
  { name: "dn_no", label: "DN No." },
  { name: "dn_doc", label: "DN Document" },
  { name: "dn_date", label: "DN Date" },
  { name: "po_no", label: "PO No." },
  { name: "ref_no", label: "Ref No." },
  { name: "amount", label: "Amount" },
  { name: "payment_term", label: "Payment Term" },
  { name: "remarks", label: "Remarks" },
  { name: "created_at", label: "Uploaded At" },
  { name: "admin_id", label: "Uploaded By" },
];

export default function DebitNotesShow() {
  return (
    <ShowPage resourceName="debitnotes" fields={FIELDS} title="Debit Note" />
  );
}
