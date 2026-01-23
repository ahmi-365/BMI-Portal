import FileDownloadButton from "../../components/common/FileDownloadButton";
import { ShowPage } from "../../components/common/ShowPage";
import { formatAmount } from "../../lib/currencyUtils";
import { formatDate } from "../../lib/dateUtils";

const FIELDS = [
  { name: "id", label: "ID" },
  { name: "customer_no", label: "Customer No." },
  {
    name: "user.company", label: "Company Name",
    render: (_v, row) => row.user?.company ?? "-",
  },   // nested field
  { name: "cn_no", label: "CN No." },
  {
    name: "cn_doc", label: "CN Document",
    render: (_v, row) => (
      <FileDownloadButton
        file={row.cn_doc}
        id={row.id}
        endpoint="creditnotes"
        path="download"
      />
    ),
  },
{
    name: "cn_date",
    label: "CN Date",
    // Use formatDate for consistent DMY format (e.g., 12 Dec 2025)
    render: (value) => formatDate(value),
  },
  { name: "po_no", label: "PO No." },
  { name: "ref_no", label: "Ref No." },
  { name: "amount", label: "Amount", render: (value) => formatAmount(value) },
  { name: "remarks", label: "Remarks" },
 {
    name: "payment_term",
    label: "Payment Term",
    // Use formatDate for consistent DMY format
    render: (value) => formatDate(value),
  },
  {
    name: "created_at",
    label: "Uploaded At",
    // Use formatDate for consistent DMY format
    render: (value) => formatDate(value),
  },
  {
    name: "admin_id", label: "Uploaded By",
    render: (_v, row) => row.admin?.name || "-"
  },
];

export default function CreditNotesShow() {
  return (
    <ShowPage
      resourceName="creditnotes"
      fields={FIELDS}
      title="Credit Note"
    />
  );
}
