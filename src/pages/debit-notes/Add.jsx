import { ResourceForm } from "../../components/common/ResourceForm";
import { apiCallFormData } from "../../services/api";

const FIELDS = [
  { name: "user_id", label: "Company Name", type: "text", required: true },
  { name: "customer_no", label: "Customer No.", type: "text", required: true },
  { name: "po_no", label: "Customer PO No.", type: "text", required: true },
  { name: "amount", label: "Amount (MYR)", type: "number", required: true },
  { name: "ref_no", label: "Reference No.", type: "text", required: true },
  { name: "dn_no", label: "DN No.", type: "text" },
  { name: "file", label: "DN Document", type: "file" },
  { name: "dn_date", label: "DN Date", type: "date" },
  { name: "due_date", label: "Due Date", type: "date" },
  { name: "remarks", label: "Remarks", type: "textarea" },
];

export default function DebitNotesAdd() {
  const handleSubmit = async (formData) => {
    // Build FormData from the form object
    const fd = new FormData();
    Object.keys(formData).forEach((key) => {
      const val = formData[key];
      if (val instanceof File) {
        fd.append(key, val, val.name);
      } else if (val !== undefined && val !== null && val !== "") {
        fd.append(key, String(val));
      }
    });
    return await apiCallFormData("/debitnotes/create", fd, "POST");
  };

  return (
    <ResourceForm
      resourceName="debitnotes"
      fields={FIELDS}
      title="New Debit Note"
      mode="add"
      onSubmit={handleSubmit}
    />
  );
}
