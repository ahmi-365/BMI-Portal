import { ListPage } from "../../components/common/ListPage";
import PageMeta from "../../components/common/PageMeta";

const COLUMNS = [
  { header: "Payment ID", accessor: "paymentId" },
  { header: "Reference No.", accessor: "referenceNo" },
  { header: "Payment Date", accessor: "paymentDate" },
  { header: "Amount", accessor: "amount" },
  { header: "Status", accessor: "status" },
  { header: "Proof", accessor: "proof" },
  { header: "Uploaded at", accessor: "uploadedAt" },
  { header: "Uploaded By", accessor: "uploadedBy" },
];

export default function UserPayments() {
  return (
    <div>
      <PageMeta
        title="Payments - BMI Invoice Management System"
        description="View and manage your payment records."
      />
      <ListPage
        resourceName="user/payments"
        columns={COLUMNS}
        title="My Payments"
        subtitle="View and manage your payment records"
      />
    </div>
  );
}
