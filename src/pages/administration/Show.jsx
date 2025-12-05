import { ShowPage } from "../../components/common/ShowPage";

const FIELDS = [
  { name: "id", label: "ID" },
  { name: "name", label: "Admin Name" },
  { name: "email", label: "Email" },
  {
    name: "mailable",
    label: "Mailable",
    type: "checkbox",
    render: (value) => (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value
            ? "bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400"
            : "bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400"
        }`}
      >
        {value ? "Yes" : "No"}
      </span>
    ),
  },
  { name: "createdAt", label: "Created At" },
];

export default function AdministrationShow() {
  return (
    <ShowPage
      resourceName="administration"
      fields={FIELDS}
      title="Administration User"
    />
  );
}
