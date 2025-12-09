import { ListPage } from "../../components/common/ListPage";
import PageMeta from "../../components/common/PageMeta";

const COLUMNS = [
  { header: "Supplier No.", accessor: "supplierNo" },
  { header: "Supplier Name", accessor: "supplierName" },
  { header: "Debit Note No.", accessor: "dnNo" },
  { header: "DN Doc", accessor: "dnDoc" },
  { header: "DN Date", accessor: "dnDate" },
  { header: "Amount", accessor: "amount" },
  { header: "Outstanding", accessor: "outstanding" },
  { header: "Due Date", accessor: "dueDate" },
  { header: "Uploaded at", accessor: "uploadedAt" },
  { header: "Uploaded By", accessor: "uploadedBy" },
];

export default function UserDebitNotes() {
  return (
    <div>
      <PageMeta
        title="Debit Notes - BMI Invoice Management System"
        description="View your debit notes, track status, and access associated documents."
      />
      <ListPage
        resourceName="user/debit-notes"
        columns={COLUMNS}
        title="My Debit Notes"
        subtitle="View and track your debit notes"
      />
    </div>
  );
}
