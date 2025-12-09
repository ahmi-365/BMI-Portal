import { ListPage } from "../../components/common/ListPage";
import PageMeta from "../../components/common/PageMeta";

const COLUMNS = [
  { header: "Supplier No.", accessor: "supplierNo" },
  { header: "Supplier Name", accessor: "supplierName" },
  { header: "DO No.", accessor: "doNo" },
  { header: "DO Doc", accessor: "doDoc" },
  { header: "DO Date", accessor: "doDate" },
  { header: "Amount", accessor: "amount" },
  { header: "Outstanding", accessor: "outstanding" },
  { header: "Received Date", accessor: "receivedDate" },
  { header: "Uploaded at", accessor: "uploadedAt" },
  { header: "Uploaded By", accessor: "uploadedBy" },
];

export default function UserDeliveryOrders() {
  return (
    <div>
      <PageMeta
        title="Delivery Orders - BMI Invoice Management System"
        description="View your delivery orders, track status, and access associated documents."
      />
      <ListPage
        resourceName="user/delivery-orders"
        columns={COLUMNS}
        title="My Delivery Orders"
        subtitle="View and track your delivery orders"
      />
    </div>
  );
}
