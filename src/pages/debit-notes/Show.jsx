import FileDownloadButton from "../../components/common/FileDownloadButton";
import { ShowPage } from "../../components/common/ShowPage";
import { formatDate } from "../../lib/dateUtils";

const FIELDS = [
  {
    name: "company", label: "Company Name",
    render: (_v, row) => row.user?.company ?? "-",
  },
  { name: "customer_no", label: "Customer No." },
  { name: "dn_no", label: "DN No." },
  {
    name: "dn_doc",
    label: "DN Document",
    render: (_v, row) => (
      <FileDownloadButton
        file={row.dn_doc}   // or row.do_doc if your field is do_doc
        id={row.id}
        endpoint="deliveryorders"
        path="download"
      />
    ),
  }
  ,
{
    name: "dn_date",
    label: "DN Date",
    // Use formatDate for consistent DMY format (e.g., 12 Dec 2025)
    render: (value) => formatDate(value),
  },
  { name: "po_no", label: "PO No." },
  { name: "ref_no", label: "Ref No." },
  { name: "amount", label: "Amount" },
  // {
  //   name: "payment_term",
  //   label: "Payment Term",
  //  render: (_v, row) => row.payment_term?.split("T")[0] ?? row.invoice?.payment_term?.split("T")[0] ?? "-"

  // }
  
  // { name: "remarks", label: "Remarks" },
  // { name: "created_at", label: "Uploaded At",
  //   render: (value) => value ? String(value).split("T")[0] : "-"
  //  },
  // { name: "admin_id", label: "Uploaded By"
  //   , render: (_v, row) => row.admin?.name || "-"
  //  },
];

export default function DebitNotesShow() {
  return (
    <ShowPage resourceName="debitnotes" fields={FIELDS} title="Debit Note" />
  );
}
