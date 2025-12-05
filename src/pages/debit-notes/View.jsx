import { ListPage } from "../../components/common/ListPage";
import PageMeta from "../../components/common/PageMeta";

const COLUMNS = [
  { header: "Customer No.", accessor: "customerNo" },
  { header: "Company Name", accessor: "companyName" },
  { header: "DN No.", accessor: "dnNo" },
  { header: "DN Doc", accessor: "dnDoc" },
  { header: "DN Date", accessor: "dnDate" },
  { header: "PO No.", accessor: "poNo" },
  { header: "Ref No.", accessor: "refNo" },
  { header: "Amount", accessor: "amount" },
  { header: "Uploaded at", accessor: "uploadedAt" },
  { header: "Uploaded By", accessor: "uploadedBy" },
];

export default function DebitNotesView() {
  return (
    <div>
      <PageMeta
        title="Debit Notes - BMI Invoice Management System"
        description="Manage and track all debit notes. View debit note details and associated financial records."
      />
      <ListPage
        resourceName="debit-notes"
        columns={COLUMNS}
        title="Debit Notes"
        addButtonText="New Debit Note"
      />
    </div>
  );
}
