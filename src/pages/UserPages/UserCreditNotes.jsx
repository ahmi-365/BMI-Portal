import { ListPage } from "../../components/common/ListPage";
import PageMeta from "../../components/common/PageMeta";

const COLUMNS = [
  { header: "Supplier No.", accessor: "supplierNo" },
  { header: "Supplier Name", accessor: "supplierName" },
  { header: "Credit Note No.", accessor: "cnNo" },
  { header: "CN Doc", accessor: "cnDoc" },
  { header: "CN Date", accessor: "cnDate" },
  { header: "Amount", accessor: "amount" },
  { header: "Outstanding", accessor: "outstanding" },
  { header: "Due Date", accessor: "dueDate" },
  { header: "Uploaded at", accessor: "uploadedAt" },
  { header: "Uploaded By", accessor: "uploadedBy" },
];

export default function UserCreditNotes() {
  return (
    <div>
      <PageMeta
        title="Credit Notes - BMI Invoice Management System"
        description="View your credit notes, track status, and access associated documents."
      />
      <ListPage
        resourceName="user/credit-notes"
        columns={COLUMNS}
        title="My Credit Notes"
        subtitle="View and track your credit notes"
      />
    </div>
  );
}
