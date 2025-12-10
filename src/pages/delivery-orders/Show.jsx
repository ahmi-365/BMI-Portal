import { ShowPage } from "../../components/common/ShowPage";

const FIELDS = [
  { name: "id", label: "ID" },
  { name: "customer_no", label: "Customer No." },
  { name: "company_name", label: "Company Name" },
  { name: "do_no", label: "DO No." },
  {
    name: "do_doc",
    label: "DO Document",
    type: "file",
    render: (value) =>
      value ? (
        <a
          href={value}
          target="_blank"
          className="text-blue-600 hover:underline"
        >
          View Document
        </a>
      ) : (
        "No Document"
      ),
  },
  { name: "invoice_no", label: "Invoice No." },
  { name: "po_no", label: "PO No." },
  { name: "invoice_date", label: "Invoice Date" },
  { name: "created_at", label: "Uploaded At" },
  { name: "uploaded_by", label: "Uploaded By" },
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
