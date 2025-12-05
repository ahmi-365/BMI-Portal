import { ResourceForm } from "../../components/common/ResourceForm";

const FIELDS = [
  { name: "name", label: "Admin Name", type: "text", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "mailable", label: "Mailable", type: "checkbox" },
];

export default function AdministrationEdit() {
  return (
    <ResourceForm
      resourceName="administration"
      fields={FIELDS}
      title="Edit Administration User"
      mode="edit"
    />
  );
}
