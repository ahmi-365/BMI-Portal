import FileDownloadButton from "../../components/common/FileDownloadButton";
import { ShowPage } from "../../components/common/ShowPage";
import { formatAmount } from "../../lib/currencyUtils";
import { formatDate } from "../../lib/dateUtils";


const FIELDS = [
  // { name: "id", label: "ID" },
  // { name: "invoice", label: "Invoice" },
  { name: "amount", label: "Amount (MYR)", render: (value) => formatAmount(value) },

  // {
  //   name: "due_Date", // backend uses due_Date (capital D)
  //   label: "Due Date",
  //   render: (value) => (value ? String(value).split("T")[0] : "-"),
  // },
  {
    name: "status",
    label: "Status",
    render: (value) => {
      if (value === 1) {
        return (
          <span className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
            ACKNOWLEDGED
          </span>
        );
      }

      if (value === 0) {
        return (
          <span className="px-3 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded-full">
            PENDING
          </span>
        );
      }

      return (
        <span className="px-3 py-1 text-xs font-semibold text-gray-600 bg-gray-100 rounded-full">
          -
        </span>
      );
    },
  }

  ,
  {
    name: "payment_date",
    label: "Payment Date",
    render: (value) => formatDate(value),
  }
  ,

  {
    name: "proof",
    label: "Proof of Payment",
    render: (_value, row) => (
      <FileDownloadButton
        file={row.proof}
        id={row.id}
        endpoint="payments"
        path="download-proof"
      />
    ),
  },

  // { name: "reference_id", label: "Reference No." },
  // { name: "invoice_id", label: "Invoice ID" },
  // { name: "invoice_doc", label: "Invoice Doc" },
  // { name: "do_doc", label: "DO Doc" },
  // { name: "dn_doc", label: "DN Doc" },
  // { name: "cn_doc", label: "CN Doc" },
  // { name: "outstanding", label: "Outstanding" },

  // foreign key from backend
  // { name: "user_id", label: "User ID" },

  // Nested user data
  {
    name: "company",
    label: "Company Name",
    render: (_v, row) => row.user?.company ?? "-",
  },
  // {
  //   name: "name",
  //   label: "Customer Name",
  //   render: (_v, row) => row.user?.name ?? "-",
  // },
  {
    name: "customer_no",
    label: "Customer No.",
    render: (_v, row) => row.user?.customer_no ?? "-",
  },
  // {
  //   name: "email",
  //   label: "Customer Email",
  //   render: (_v, row) => row.user?.email ?? "-",
  // },
  // {
  //   name: "phone",
  //   label: "Customer Phone",
  //   render: (_v, row) => row.user?.phone ?? "-",
  // },
  // {
  //   name: "address",
  //   label: "Customer Address",
  //   render: (_v, row) => row.user?.address ?? "-",
  // },
  // {
  //   name: "payment_term",
  //   label: "Payment Term (days)",
  //   render: (_v, row) => row.user?.payment_term ?? "-",
  // },

  // {
  //   name: "created_at",
  //   label: "Created At",
  //   render: (value) => (value ? String(value).split("T")[0] : "-"),
  // },
  // {
  //   name: "updated_at",
  //   label: "Updated At",
  //   render: (value) => (value ? String(value).split("T")[0] : "-"),
  // },
];

export default function PaymentRecordsShow() {
  return (
    <ShowPage
      resourceName="payments"
      fields={FIELDS}
      title="Payment Record"
      hideEdit={true}
    />
  );
}
