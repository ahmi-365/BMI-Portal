import { ListPage } from "../../components/common/ListPage";
import PageMeta from "../../components/common/PageMeta";
import FileDownloadButton from "../../components/common/FileDownloadButton";


const COLUMNS = [
  { header: "Customer No.", accessor: "customer_no"
    , render: (row) => row.customer_no || "-"
   },
  { header: "Company Name", accessor: "company_name",
    render: (row) => row.user.company || "-"
   },
  { header: "DO No.", accessor: "do_no" ,
    render: (row) => row.do_no || "-"
  },
  {
    header: "DO Doc", accessor: "do_doc",
    render: (row) => (
      <FileDownloadButton
        file={row.do_doc}
        id={row.id}
        endpoint="deliveryorders"
        path="download"
      />
    ),
  },
  { header: "Invoice No.", accessor: "invoice_no" , 
    render: (row) => row.invoice.invoiceId || "-"
  },
  { header: "PO No.", accessor: "po_no",
    render: (row) => row.invoice.po_no || "-"
   },
 {
  header: "Invoice Date",
  accessor: "invoice_date",
  render: (row) => {
    if (!row.invoice?.invoice_date) return "-";
    return row.invoice.invoice_date.split("T")[0];
  },
},

  { header: "Amount", accessor: "amount",
    render: (row) => row.invoice.amount ? row.invoice.amount : "0"
  },
  { header: "Uploaded At", accessor: "created_at",
    render: (row) => row.created_at ? String(row.created_at).split("T")[0] : "-"

   },
  { header: "Uploaded By", accessor: "uploaded_by",
    render: (row) => row.uploaded_by || "-"
   },
];

export default function DeliveryOrdersView() {
  return (
    <div>
      <PageMeta
        title="Delivery Orders - BMI Invoice Management System"
        description="Manage and track all delivery orders. Monitor shipments, delivery status, and associated documentation."
      />
      <ListPage
        resourceName="deliveryorders"
        columns={COLUMNS}
        title="Delivery Orders"
        subtitle="View and manage all delivery orders"
      />
    </div>
  );
}
