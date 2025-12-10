import { ResourceForm } from "../../components/common/ResourceForm";

const FORM_FIELDS = [
  {
    name: "customer_no",
    label: "Customer No.",
    type: "text",
    required: true,
  },
  {
    name: "company_name",
    label: "Company Name",
    type: "text",
    required: true,
  },
  {
    name: "do_no",
    label: "DO No.",
    type: "text",
    required: true,
  },
  {
    name: "do_doc",
    label: "DO Document",
    type: "file",
    required: true,
  },
  {
    name: "invoice_no",
    label: "Invoice No.",
    type: "text",
  },
  {
    name: "po_no",
    label: "PO No.",
    type: "text",
  },
];

export default function DeliveryOrdersEdit() {
  return (
    <ResourceForm
      resourceName="deliveryorders"
      fields={FORM_FIELDS}
      title="Edit Delivery Order"
    />
  );
}
