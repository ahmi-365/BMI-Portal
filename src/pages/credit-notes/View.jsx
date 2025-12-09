import { ListPage } from "../../components/common/ListPage";
import PageMeta from "../../components/common/PageMeta";

const COLUMNS = [
  { header: "Customer No.", accessor: "customer_no" },
  { header: "Company", accessor: "user.company" }, // from nested user
  { header: "CN No.", accessor: "cn_no" },
  { header: "CN Document", accessor: "cn_doc" },
  { header: "CN Date", accessor: "cn_date" },
  { header: "PO No.", accessor: "po_no" },
  { header: "Ref No.", accessor: "ref_no" },
  { header: "Amount", accessor: "amount" },
  { header: "Remarks", accessor: "remarks" },
  { header: "Payment Term", accessor: "payment_term" },
  { header: "Uploaded At", accessor: "created_at" },
  { header: "Uploaded By", accessor: "admin_id" },
];


export default function CreditNotesView() {
  return (
    <ListPage
      resourceName="creditnotes"
      columns={COLUMNS}
      title="Credit Notes"
      addButtonText="New Credit Note"
    />
  );
}
