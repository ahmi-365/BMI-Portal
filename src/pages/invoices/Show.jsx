import FileDownloadButton from "../../components/common/FileDownloadButton";
import { ShowPage } from "../../components/common/ShowPage";
import { formatAmount } from "../../lib/currencyUtils";
import { formatDate } from "../../lib/dateUtils";


const FIELDS = [
  { name: "invoiceId", label: "Invoice No" },

  {
    name: "customer_no",
    label: "Customer No.",
    render: (_v, row) => row.user?.customer_no ?? row.user?.id ?? "-",
  },

  {
    name: "company",
    label: "Company Name",
    render: (_v, row) => row.user?.company ?? "-",
  },

  // { name: "invoiceId", label: "Invoice No." },

  {
    name: "invoice_doc",
    label: "Invoice Document",
    render: (_v, row) => (
      <FileDownloadButton
        file={row.invoice_doc}
        id={row.id}
        endpoint="invoices"
        path="download"
      />
    ),
  },

  {
    name: "invoice_date",
    label: "Invoice Date",
    render: (value) => formatDate(value),
  },

  { name: "po_no", label: "PO No." },
  { name: "do_no", label: "DO No." },
  { name: "amount", label: "Amount", render: (value) => formatAmount(value) },
  // { name: "outstanding", label: "Outstanding" },

  {
  name: "date",
  label: "Due Date",
  render: (value) => formatDate(value),
}


];


export default function InvoicesShow() {
  return (
    <ShowPage
      resourceName="invoices"
      fields={FIELDS}
      title="Invoice Details"
    />
  );
}
