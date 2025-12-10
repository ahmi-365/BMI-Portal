import { ResourceForm } from "../../components/common/ResourceForm";
import { FORM_FIELDS } from "./Add";

export default function PaymentRecordsEdit() {
  // Do NOT pass `onSubmit` here — ResourceForm will detect `id` and use the
  // generic updateResource path so the same form UI is used for edit.
  return (
    <ResourceForm
      resourceName="payments"
      fields={FORM_FIELDS}
      title="Edit Payment Record"
      mode="edit"
    />
  );
}
