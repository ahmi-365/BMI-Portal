import FileDownloadButton from "../../components/common/FileDownloadButton";
import { ShowPage } from "../../components/common/ShowPage";

const FIELDS = [
  { name: "id", label: "Invoice No" },

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
    render: (value) => (value ? String(value).split("T")[0] : "-"),
  },

  { name: "po_no", label: "PO No." },
  { name: "do_no", label: "DO No." },
  { name: "amount", label: "Amount" },
  // { name: "outstanding", label: "Outstanding" },

  {
    name: "date",
    label: "Due Date",
    render: (value) => (value ? String(value).split("T")[0] : "-"),
  },

  // {
  //   name: "created_at",
  //   label: "Uploaded At",
  //   render: (value) => (value ? String(value).split("T")[0] : "-"),
  // },

  // {
  //   name: "uploadedBy",
  //   label: "Uploaded By",
  //   render: (_v, row) => row.admin?.name ?? "-",
  // },
];


export default function InvoicesShow() {
  return (
    <ShowPage
      resourceName="invoices/"
      fields={FIELDS}
      title="Invoice Details"
    />
  );
}
