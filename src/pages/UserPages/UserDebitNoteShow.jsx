import FileDownloadButton from "../../components/common/FileDownloadButton";
import { ShowPage } from "../../components/common/ShowPage";
import { formatAmount } from "../../lib/currencyUtils";
import { formatDate } from "../../lib/dateUtils";
import { userDebitNotesAPI } from "../../services/api";


const FIELDS = [
  { name: "id", label: "ID" },
  {
    name: "dn_no",
    label: "Debit Note No.",
    render: (value) => value || "-",
  },
  {
    name: "dn_doc",
    label: "DN Document",
    render: (_value, row) => (
      <FileDownloadButton
        file={row.dn_doc}
        id={row.id}
        endpoint="user/debit-notes"
        path="download"
        isUserAPI={true}
      />
    ),
  },
  {
    name: "dn_date",
    label: "DN Date",
    render: (value) => formatDate(value),
  },
  {
    name: "payment_term",
    label: "Payment Term",
    render: (value) => formatDate(value),
  },
  {
    name: "customer_no",
    label: "Customer No.",
    render: (value) => value || "-",
  },
  {
    name: "po_no",
    label: "PO No.",
    render: (value) => value || "-",
  },
  {
    name: "ref_no",
    label: "Reference No.",
    render: (value) => value || "-",
  },
  {
    name: "amount",
    label: "Amount",
    render: (value) => formatAmount(value || "0"),
  },
  {
    name: "remarks",
    label: "Remarks",
    render: (value) => value || "-",
  },
  {
    name: "created_at",
    label: "Created At",
    render: (value) => formatDate(value), 
  },
  {
    name: "updated_at",
    label: "Updated At",
    render: (value) => formatDate(value),
  },
];

export default function UserDebitNoteShow() {
  return (
    <ShowPage
      resourceName="user/debit-notes"
      fields={FIELDS}
      title="Debit Note Details"
      showEdit={false}
      backPath="/user/debit-notes"
      apiCall={userDebitNotesAPI.show}
    />
  );
}
