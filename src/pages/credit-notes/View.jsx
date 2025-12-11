import { ListPage } from "../../components/common/ListPage";
import PageMeta from "../../components/common/PageMeta";
import FileDownloadButton from "../../components/common/FileDownloadButton";

const COLUMNS = [
  { header: "Customer No.", accessor: "customer_no"
    
   },
  { header: "Company", accessor: "companyName",
      render: (row) => row.user?.company || "-",

   }, // from nested user
  { header: "CN No.", accessor: "cn_no",
      render: (row) => row.cn_no || "N/A",

   },
  { header: "CN Document", accessor: "cn_doc",
     render: (row) => (
          <FileDownloadButton
            file={row.cn_doc}
            id={row.id}
            endpoint="creditnotes"
            path="download"
          />
        ),
   },
  { header: "CN Date", accessor: "cn_date",
      render: (row) => new Date(row.cn_date).toLocaleDateString(),
   },
  { header: "PO No.", accessor: "po_no" ,
      render: (row) => row.po_no || "N/A",
  },
  { header: "Ref No.", accessor: "ref_no",
      render: (row) => row.ref_no || "-",
   },
  { header: "Amount", accessor: "amount" ,

  },
  { header: "Remarks", accessor: "remarks" ,
      render: (row) => row.remarks || "-",
  },
  { header: "Payment Term", accessor: "payment_term",
      render: (row) => row.payment_term?.term || "-",
   },
  { header: "Uploaded At", accessor: "created_at" 
    ,    render: (row) => new Date(row.created_at).toLocaleString(),
  },
  { header: "Uploaded By", accessor: "admin_id",
      render: (row) => row.admin?.name || "N/A",
   },
];


export default function CreditNotesView() {
  return (
    <ListPage
      resourceName="creditnotes"
      columns={COLUMNS}
      title="Credit Notes"
      addButtonText="New Credit Note"
    />
  );
}
