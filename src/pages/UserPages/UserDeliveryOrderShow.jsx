import { ShowPage } from "../../components/common/ShowPage";
import { userDeliveryOrdersAPI } from "../../services/api";
import FileDownloadButton from "../../components/common/FileDownloadButton";  
import { formatDate } from "../../lib/dateUtils";

const FIELDS = [
  { name: "id", label: "ID" },
  {
    name: "do_no",
    label: "DO No.",
    render: (value) => value || "-",
  },
  {
    name: "do_doc",
    label: "DO Document",
    render: (_value, row) => (
      <FileDownloadButton
        file={row.do_doc}
        id={row.id}
        endpoint="user/delivery-orders"
        path="download"
        isUserAPI={true}
      />
    ),
  },
  {
    name: "do_date",
    label: "DO Date",
    render: (value) => formatDate(value),
  },
  {
    name: "date",
    label: "Date",
    render: (value) => formatDate(value),
  },
  {
    name: "invoice_id",
    label: "Invoice ID",
    render: (value) => value || "-",
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
    name: "order_no",
    label: "Order No.",
    render: (value) => value || "-",
  },
  {
    name: "amount",
    label: "Amount",
    render: (value) => value || "0",
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

export default function   UserDeliveryOrderShow() {
  return (
    <ShowPage
      resourceName="user/delivery-orders"
      fields={FIELDS}
      title="Delivery Order Details"
      showEdit={false}
      backPath="/user/delivery-orders"
      apiCall={userDeliveryOrdersAPI.show}
    />
  );
}
