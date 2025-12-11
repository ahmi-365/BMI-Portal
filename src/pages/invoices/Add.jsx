import { ResourceForm } from "../../components/common/ResourceForm";
import { invoicesAPI } from "../../services/api";
import { useParams } from "react-router-dom";

const FORM_FIELDS = [
  {
    name: "customer_no",
    label: "Customer No.",
    type: "text",
    required: true,
  },
  {
    name: "po_no",
    label: "Customer PO No.",
    type: "text",
    required: true,
  },
  {
    name: "invoiceId",
    label: "Invoice No.",
    type: "text",
    required: true,
  },
  {
    name: "do_no",
    label: "Delivery Order No. (Can add multiple comma separated DO No's)",
    type: "text",
    placeholder: "DO123, DO124",
  },
  {
    name: "invoice_date",
    label: "Invoice Date",
    type: "date",
    required: true,
  },
  {
    name: "date",
    label: "Due Date",
    type: "date",
    required: true,
  },
  {
    name: "invoice_doc",
    label: "Invoice Document",
    type: "file",
    required: true,
  },
  {
    name: "amount",
    label: "Amount (MYR)",
    type: "number",
    required: true,
  },
  {
    name: "remarks",
    label: "Remarks",
    type: "textarea",
  },
];

export default function InvoicesAdd() {
  const { id } = useParams();
  const isEditMode = !!id;

  const handleSubmit = async (formData) => {
    // Build FormData for file uploads
    const fd = new FormData();
    Object.keys(formData).forEach((key) => {
      const val = formData[key];
      if (val instanceof File) {
        fd.append(key, val, val.name);
      } else if (val !== undefined && val !== null) {
        fd.append(key, String(val));
      }
    });

    if (isEditMode) {
      return await invoicesAPI.update(id, fd);
    }
    return await invoicesAPI.create(fd);
  };

  return (
    <ResourceForm
      resourceName="invoices"
      fields={FORM_FIELDS}
      title={isEditMode ? " Invoice" : "New Invoice"}
      onSubmit={handleSubmit}
    />
  );
}
