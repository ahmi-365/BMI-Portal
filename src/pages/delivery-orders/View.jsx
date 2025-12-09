import { ListPage } from "../../components/common/ListPage";
import PageMeta from "../../components/common/PageMeta";

const COLUMNS = [
  { header: "Customer No.", accessor: "customerNo" },
  { header: "Company Name", accessor: "companyName" },
  { header: "DO No.", accessor: "doNo" },
  { header: "DO Doc", accessor: "doDoc" },
  { header: "Invoice No.", accessor: "invoiceNo" },
  { header: "PO No.", accessor: "po_no" },
  { header: "Invoice Date", accessor: "invoiceDate" },
  { header: "Uploaded at", accessor: "uploadedAt" },
  { header: "Uploaded By", accessor: "uploadedBy" },
];

export default function DeliveryOrdersView() {
  return (
    <div>
      <PageMeta
        title="Delivery Orders - BMI Invoice Management System"
        description="Manage and track all delivery orders. Monitor shipments, delivery status, and associated documentation."
      />
      <ListPage
        resourceName="deliveryorders"
        columns={COLUMNS}
        title="Delivery Orders"
        subtitle="View and manage all delivery orders"
      />
    </div>
  );
}
