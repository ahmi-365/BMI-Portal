import FileDownloadButton from "../../components/common/FileDownloadButton";
import { ShowPage } from "../../components/common/ShowPage";
import { formatAmount } from "../../lib/currencyUtils";
import { formatDate } from "../../lib/dateUtils";
import { userCreditNotesAPI } from "../../services/api";


const FIELDS = [
  { name: "id", label: "ID" },
  {
    name: "cn_no",
    label: "Credit Note No.",
    render: (value) => value || "-",
  },
  {
    name: "cn_doc",
    label: "CN Document",
    render: (_value, row) => (
      <FileDownloadButton
        file={row.cn_doc}
        id={row.id}
        endpoint="user/credit-notes"
        path="download"
        isUserAPI={true}
      />
    ),
  },
  {
    name: "cn_date",
    label: "CN Date",
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

export default function UserCreditNoteShow() {
  return (
    <ShowPage
      resourceName="user/credit-notes"
      fields={FIELDS}
      title="Credit Note Details"
      showEdit={false}
      backPath="/user/credit-notes"
      apiCall={userCreditNotesAPI.show}
    />
  );
}
