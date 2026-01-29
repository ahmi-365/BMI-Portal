import { ShowPage } from "../../components/common/ShowPage";
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

const fileArrayRender = (files, data) => {
  if (!files || (Array.isArray(files) && files.length === 0)) {
    return "-";
  }
  
  const fileArray = Array.isArray(files) ? files : [files];
  
  return (
    <div className="flex flex-col gap-2">
      {fileArray.map((file, index) => (
        <a
          key={index}
          href={file}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-500 hover:underline"
        >
          File {index + 1}
        </a>
      ))}
    </div>
  );
};


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
  { name: "payment_term", label: "Payment Term (Days)" },
  { 
    name: "letter_of_guarantee", 
    label: "Letter of Guarantee", 
    render: fileRender 
  },
  { 
    name: "credit_application_files", 
    label: "Credit Application Files", 
    render: fileArrayRender 
  },
  { 
    name: "registration_files", 
    label: "Registration Files", 
    render: fileArrayRender 
  },
  { 
    name: "pdpa", 
    label: "PDPA/Consent Letter", 
    render: fileRender 
  }
];

export default function CustomersShow() {
  return <ShowPage resourceName="customers" fields={FIELDS} title="Customer" />;
}
