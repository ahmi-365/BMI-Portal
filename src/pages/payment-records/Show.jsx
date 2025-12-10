import { ShowPage } from "../../components/common/ShowPage";

const FIELDS = [
  { name: "id", label: "ID" },
  { name: "invoice", label: "Invoice" },
  { name: "amount", label: "Amount (MYR)" },
  {
    name: "due_Date",
    label: "Due Date",
    render: (value) => (value ? String(value).split("T")[0] : "-"),
  },
  {
    name: "payment_date",
    label: "Payment Date",
    render: (value) => (value ? String(value).split("T")[0] : "-"),
  },
  {
    name: "proof",
    label: "Proof of Payment",
    render: (value) => (value ? String(value) : "-"),
  },
  { name: "reference_id", label: "Reference No." },
  { name: "invoice_id", label: "Invoice ID" },
  { name: "invoice_doc", label: "Invoice Doc" },
  { name: "do_doc", label: "DO Doc" },
  { name: "dn_doc", label: "DN Doc" },
  { name: "cn_doc", label: "CN Doc" },
  { name: "outstanding", label: "Outstanding" },

  // Top-level user id (foreign key)
  { name: "user_id", label: "User ID" },

  // Nested `user` object fields — use render to read from the full record
  {
    name: "user_company",
    label: "Company",
    render: (_v, row) => row.user?.company ?? "-",
  },
  {
    name: "user_name",
    label: "Customer Name",
    render: (_v, row) => row.user?.name ?? "-",
  },
  {
    name: "user_customer_no",
    label: "Customer No.",
    render: (_v, row) => row.user?.customer_no ?? row.user?.id ?? "-",
  },
  {
    name: "user_email",
    label: "Customer Email",
    render: (_v, row) => row.user?.email ?? "-",
  },
  {
    name: "user_phone",
    label: "Customer Phone",
    render: (_v, row) => row.user?.phone ?? "-",
  },
  {
    name: "user_address",
    label: "Customer Address",
    render: (_v, row) => row.user?.address ?? "-",
  },
  {
    name: "user_payment_term",
    label: "Payment Term (days)",
    render: (_v, row) => (row.user?.payment_term ?? "-"),
  },

  {
    name: "created_at",
    label: "Created At",
    render: (value) => (value ? String(value).split("T")[0] : "-"),
  },
  {
    name: "updated_at",
    label: "Updated At",
    render: (value) => (value ? String(value).split("T")[0] : "-"),
  },
];

export default function PaymentRecordsShow() {
  return (
    <ShowPage resourceName="payments" fields={FIELDS} title="Payment Record" />
  );
}
