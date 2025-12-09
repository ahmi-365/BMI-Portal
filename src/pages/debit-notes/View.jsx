import { ListPage } from "../../components/common/ListPage";
import PageMeta from "../../components/common/PageMeta";

const COLUMNS = [
  { header: "Customer No.", accessor: "customer_no" },
  { header: "DN No.", accessor: "dn_no" },
  { header: "DN Document", accessor: "dn_doc" },
  { header: "DN Date", accessor: "dn_date" },
  { header: "PO No.", accessor: "po_no" },
  { header: "Ref No.", accessor: "ref_no" },
  { header: "Amount", accessor: "amount" },
  { header: "Payment Term", accessor: "payment_term" },
  { header: "Remarks", accessor: "remarks" },
  { header: "Uploaded At", accessor: "created_at" },
  { header: "Uploaded By", accessor: "admin_id" },
];


export default function DebitNotesView() {
  return (
    <div>
      <PageMeta
        title="Debit Notes - BMI Invoice Management System"
        description="Manage and track all debit notes. View debit note details and associated financial records."
      />
      <ListPage
        resourceName="debitnotes"
        columns={COLUMNS}
        title="Debit Notes"
        addButtonText="New Debit Note"
      />
    </div>
  );
}
