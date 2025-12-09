import { ShowPage } from "../../components/common/ShowPage";
import { downloadBlob } from "../../services/api";

const fileRender = (filename, data) =>
  filename ? (
    <a
      href={`${filename}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-brand-500 hover:underline"
    >
      {filename}
    </a>
  ) : (
    "-"
  );


const FIELDS = [
  { name: "id", label: "ID" },
  { name: "name", label: "Customer Name" },
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
  { name: "cc1", label: "Credit App (CC1)", render: fileRender },
  { name: "form_24", label: "Form 24", render: fileRender },
  { name: "form_9", label: "Form 9", render: fileRender },
  {
    name: "financial_statement",
    label: "Financial Statement",
    render: fileRender,
  },
  { name: "pdpa", label: "PDPA", render: fileRender },
];

export default function CustomersShow() {
  return <ShowPage resourceName="customers" fields={FIELDS} title="Customer" />;
}
