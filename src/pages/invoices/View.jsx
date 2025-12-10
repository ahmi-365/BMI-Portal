import { ListPage } from "../../components/common/ListPage";
import PageMeta from "../../components/common/PageMeta";
import FileDownloadButton from "../../components/common/FileDownloadButton";

const COLUMNS = [
  {
    header: "Customer No.",
    accessor: "customer_no",
    render: (row) => row.user?.customer_no ?? row.user?.id ?? "-",
  },
  {
    header: "Company Name",
    accessor: "companyName",
    render: (row) => row.user?.company ?? "-",
  },
  { header: "Invoice No.", accessor: "invoiceId" },
  {
    header: "Invoice Doc",
    accessor: "invoice_doc",
    render: (row) => (
      <FileDownloadButton 
        file={row.invoice_doc} 
        id={row.id} 
        endpoint="invoices" 
        path="download" 
      />
    ),
  },
  { 
    header: "Invoice Date", 
    accessor: "invoice_date", 
    render: (row) => {
      const invoiceDateValue = row.invoice_date 
        ? String(row.invoice_date).split("T")[0] 
        : "-";
      return invoiceDateValue;
    }
  },
  { 
    header: "PO No.", 
    accessor: "po_no",
    render: (row) => {
      const poNoValue = row.po_no ? row.po_no : "-";
      return poNoValue;
    }
  },
  { 
    header: "DO No.", 
    accessor: "do_no",
    render: (row) => {
      const doNoValue = row.do_no ? row.do_no : "-";
      return doNoValue;
    }
  },
  { 
    header: "Amount", 
    accessor: "amount",
    render: (row) => {
      const amountValue = row.amount ? row.amount : "0";
      return amountValue;
    }
  },
  { 
    header: "Outstanding", 
    accessor: "outstanding",
    render: (row) => {
      const outstandingValue = row.outstanding ? row.outstanding : "0";
      return outstandingValue;
    }
  },
  { 
    header: "Due Date", 
    accessor: "date",
    render: (row) => {
      const dateValue = row.date ? String(row.date).split("T")[0] : "-";
      return dateValue;
    }
  },
  { header: "Uploaded at", accessor: "created_at" },
  {
    header: "Uploaded By",
    accessor: "uploadedBy",
    render: (row) => row.admin?.name ?? "-"
  }
];

export default function InvoicesView() {
  return (
    <div>
      <PageMeta
        title="Invoices - BMI Invoice Management System"
        description="Manage and track all invoices. View invoice details, payment status, and associated documents in one place."
      />
      <ListPage
        resourceName="invoices/index"
        columns={COLUMNS}
        title="Invoices"
        subtitle="View and manage all invoices"
        basePath="/invoices"
        showEdit={true}
      />
    </div>
  );
}