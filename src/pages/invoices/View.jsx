import { ListPage } from "../../components/common/ListPage";
import PageMeta from "../../components/common/PageMeta";

const COLUMNS = [
  { header: "Customer No.", accessor: "customerNo" },
  { header: "Company Name", accessor: "companyName" },
  { header: "Invoice No.", accessor: "invoiceNo" },
  { header: "Invoice Doc", accessor: "invoiceDoc" },
  { header: "Invoice Date", accessor: "invoiceDate" },
  { header: "PO No.", accessor: "poNo" },
  { header: "DO No.", accessor: "doNo" },
  { header: "Amount", accessor: "amount" },
  { header: "Outstanding", accessor: "outstanding" },
  { header: "Due Date", accessor: "dueDate" },
  { header: "Uploaded at", accessor: "uploadedAt" },
  { header: "Uploaded By", accessor: "uploadedBy" },
];

export default function InvoicesView() {
  return (
    <div>
      <PageMeta
        title="Invoices - BMI Invoice Management System"
        description="Manage and track all invoices. View invoice details, payment status, and associated documents in one place."
      />
      <ListPage
        resourceName="invoices"
        columns={COLUMNS}
        title="Invoices"
        subtitle="View and manage all invoices"
      />
    </div>
  );
}
