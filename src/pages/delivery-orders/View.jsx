import { ListPage } from "../../components/common/ListPage";
import PageMeta from "../../components/common/PageMeta";

const COLUMNS = [
  { header: "Customer No.", accessor: "customer_no" },
  { header: "Company Name", accessor: "company_name" },
  { header: "DO No.", accessor: "do_no" },
  { header: "DO Doc", accessor: "do_doc" },
  { header: "Invoice No.", accessor: "invoice_no" },
  { header: "PO No.", accessor: "po_no" },
  { header: "Invoice Date", accessor: "invoice_date" },
  { header: "Uploaded At", accessor: "created_at" },
  { header: "Uploaded By", accessor: "uploaded_by" },
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
