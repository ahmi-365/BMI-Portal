import { render } from "@fullcalendar/core/preact.js";
import { ShowPage } from "../../components/common/ShowPage";
import { downloadBlob } from "../../services/api";
import { formatDate } from "../../lib/dateUtils";

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
  // { name: "id", label: "ID" },
  { name: "name", label: "Company/Business Name" },
  { name: "name", label: "Business Contact Name" },
  { name: "address", label: "Billing Address" },
  { name: "phone", label: "Contact No." },
  // { name: "created_at", label: "Created At" },
  {
  name: "status",
  label: "Status",
  render: (value) => {
    const isActive = Number(value) !== 0;

    return (
      <span
        className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full
          ${isActive
            ? "bg-green-100 text-green-700"
            : "bg-yellow-100 text-yellow-700"}
        `}
      >
        {isActive ? "ACTIVE" : "PENDING"}
      </span>
    );
  },
}
,
  { name: "customer_no", label: "Customer No." },

  { name: "email", label: "Business Email (Primary)" },
  { name: "email2", label: "Business Email 2" },

  { name: "email3", label: "Business Email 3" },

  // {
  //   name: "mailable",
  //   label: "Mailable",
  //   type: "checkbox",
  //   render: (value) => (
  //     <span
  //       className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
  //         value
  //           ? "bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400"
  //           : "bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400"
  //       }`}
  //     >
  //       {value ? "Yes" : "No"}
  //     </span>
  //   ),
  // },
 {
    name: "created_at",
    label: "Created At",
    // CHANGE: Use formatDate for consistent DMY format
    render: (value) => formatDate(value),
  },
  { name: "cc1", label: "Credit App (CC1/CC2)", render: fileRender },
  { name: "form_24", label: "Form 24", render: fileRender },
  { name: "form_9", label: "Form 9", render: fileRender },
  {
    name: "financial_statement",
    label: "Financial Statement",
    render: fileRender,
  },
  { name: "pdpa", label: "PDPA/Consent Letter", render: fileRender },
];

export default function CustomersShow() {
  return <ShowPage resourceName="customers" fields={FIELDS} title="Customer" />;
}
