import { ResourceForm } from "../../components/common/ResourceForm";

const FIELDS = [
  { name: "name", label: "Admin Name", type: "text", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "mailable", label: "Mailable", type: "checkbox" },
];

export default function AdministrationAdd() {
  return (
    <ResourceForm
      resourceName="administration"
      fields={FIELDS}
      title="Create Administration User"
      mode="add"
    />
  );
}
