import { ResourceForm } from "../../components/common/ResourceForm";

const FORM_FIELDS = [
  {
    name: "customerNo",
    label: "Customer No.",
    type: "text",
    required: true,
  },
  {
    name: "companyName",
    label: "Company Name",
    type: "text",
    required: true,
  },
  {
    name: "doNo",
    label: "DO No.",
    type: "text",
    required: true,
  },
  {
    name: "doDoc",
    label: "DO Document",
    type: "file",
    required: true,
  },
  {
    name: "invoiceNo",
    label: "Invoice No.",
    type: "text",
  },
  {
    name: "poNo",
    label: "PO No.",
    type: "text",
  },
];

export default function DeliveryOrdersEdit() {
  return (
    <ResourceForm
      resourceName="delivery-orders"
      fields={FORM_FIELDS}
      title="Edit Delivery Order"
    />
  );
}
