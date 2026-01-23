import FileDownloadButton from "../../components/common/FileDownloadButton";
import { ShowPage } from "../../components/common/ShowPage";
import { ppisAPI } from "../../services/api";
// CHANGE: Import formatDate utility
import { formatAmount } from "../../lib/currencyUtils";
import { formatDate } from "../../lib/dateUtils";

const FIELDS = [
  { name: "id", label: "ID" },
  {
    name: "user.company",
    label: "Company Name",
    render: (_v, row) => row.user?.company ?? "-",
  },
  {
    name: "ppi_date",
    label: "PPI Date",
    // CHANGE: Use formatDate for DMY format
    render: (value) => formatDate(value),
  },
  {
    name: "payment_term",
    label: "Payment Term",
    // CHANGE: Use formatDate for DMY format
    render: (value) => formatDate(value),
  },
  { name: "amount", label: "Amount", render: (value) => formatAmount(value) },
  { name: "ppi_percentage", label: "PPI %" },
  { name: "customer_no", label: "Customer No." },
  { name: "po_no", label: "PO No." },
  { name: "ref_no", label: "Reference No." },
  { name: "remarks", label: "Remarks" },
  {
    name: "ppi_doc",
    label: "PPI Document",
    render: (_v, row) => (
      <FileDownloadButton
        file={row.ppi_doc}
        id={row.id}
        endpoint="ppis"
        path="download"
      />
    ),
  },
  {
    name: "created_at",
    label: "Uploaded At",
    // CHANGE: Use formatDate for DMY format
    render: (value) => formatDate(value),
  },
  {
    name: "admin_id",
    label: "Uploaded By",
    render: (_v, row) => row.admin?.name || "-",
  },
];

export default function PpisShow() {
  return (
    <ShowPage
      resourceName="ppis"
      fields={FIELDS}
      title="PPI"
      apiCall={ppisAPI.show}
    />
  );
}