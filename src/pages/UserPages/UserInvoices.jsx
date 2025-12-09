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

export default function UserInvoices() {
  return (
    <div>
      <PageMeta
        title="Invoices - BMI Invoice Management System"
        description="View your invoices, track payment status, and access associated documents."
      />
      <ListPage
        resourceName="user/invoices"
        columns={COLUMNS}
        title="My Invoices"
        subtitle="View and track your invoices"
      />
    </div>
  );
}
