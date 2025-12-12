import { render } from "@fullcalendar/core/preact.js";
import { ShowPage } from "../../components/common/ShowPage";
import FileDownloadButton from "../../components/common/FileDownloadButton";

const FIELDS = [
  { name: "id", label: "ID" },
  {
    name: "customer_no", label: "Customer No.",
    //  render: (row) => row.customer_no || "-",
  },
  {
    name: "company_name", label: "Company Name"
    , render: (_v, row) => row.user?.company ?? "-",
  },
  {
    name: "do_no", label: "DO No.",
    render: (value) => (value ? value : "-"),
  },
  {
    name: "do_doc",
    label: "DO Document",
    type: "file",
    render: (_value, row) => (
      <FileDownloadButton
        file={row.do_doc}
        id={row.id}
        endpoint="deliveryorders"
        path="download"
      />
    ),
  },
  {
    name: "invoiceid",
    label: "Invoice No.",
    render: (_v, row) => row.invoice?.invoiceId ?? "-",
  },
  {
    name: "po_no",
    label: "PO No.",
    render: (_v, row) => row.po_no ?? row.invoice?.po_no ?? "-",
  }
  ,
  {
  name: "invoice_date",
  label: "Invoice Date",
  render: (_v, row) => {
    const date = row.invoice?.invoice_date;
    return date ? String(date).split("T")[0] : "-";
  },
},

  {
    name: "amount", label: "Amount",
    render: (_v, row) => {
      const amount = row.invoice?.amount;
      return amount ? amount : "0";
    }
  },
  {
    name: "created_at", label: "Uploaded At",
    render: (value) => (value ? String(value).split("T")[0] : "-"),
  },
  {
    name: "uploaded_by", label: "Uploaded By",
    render: (value) => (value ? value : "-"),
  },
];

export default function DeliveryOrdersShow() {
  return (
    <ShowPage
      resourceName="deliveryorders"
      fields={FIELDS}
      title="Delivery Order"
    />
  );
}
