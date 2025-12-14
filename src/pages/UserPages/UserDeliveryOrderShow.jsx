import { ShowPage } from "../../components/common/ShowPage";
import { userDeliveryOrdersAPI } from "../../services/api";
import FileDownloadButton from "../../components/common/FileDownloadButton";

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
    render: (value) => {
      if (!value) return "-";
      return new Date(value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
  {
    name: "date",
    label: "Date",
    render: (value) => {
      if (!value) return "-";
      return new Date(value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
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
    render: (value) => {
      if (!value) return "-";
      return new Date(value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },
  {
    name: "updated_at",
    label: "Updated At",
    render: (value) => {
      if (!value) return "-";
      return new Date(value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
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
