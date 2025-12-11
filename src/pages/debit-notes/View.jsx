import { render } from "@fullcalendar/core/preact.js";
import { ListPage } from "../../components/common/ListPage";
import PageMeta from "../../components/common/PageMeta";
import FileDownloadButton from "../../components/common/FileDownloadButton";

const COLUMNS = [
  { header: "Customer No.", accessor: "customer_no"
    , render: (row) => row.customer_no || "-"
  },
  { header: "Company Name", accessor: "company_name",
    render: (row) => row.company_name || "-"
   },
  { header: "DN No.", accessor: "dn_no"
    , render: (row) => row.dn_no || "-"
   },
  { header: "DN Document", accessor: "dn_doc",
     render: (row) => (
          <FileDownloadButton
            file={row.dn_doc}
            id={row.id}
            endpoint="debitnotes"
            path="download"
          />
        ),

    
   },
  { header: "DN Date", accessor: "dn_date" 
    , render: (row) => row.dn_date ? String(row.dn_date).split("T")[0] : "-"
  },
  { header: "PO No.", accessor: "po_no"
    , render: (row) => row.po_no ? row.po_no : "-"
   },
  { header: "Ref No.", accessor: "ref_no"
    , render: (row) => row.ref_no || "-"
   },
  { header: "Amount", accessor: "amount"
    , render: (row) => row.amount ? row.amount : "0"
   },
  { header: "Payment Term", accessor: "payment_term",
    render: (row) => row.payment_term || "-"
  },
  { header: "Remarks", accessor: "remarks" 
    , render: (row) => row.remarks || "-"
  },
  { header: "Uploaded At", accessor: "created_at"
    , render: (row) => row.created_at ? String(row.created_at).split("T")[0] : "-"
   },
  { header: "Uploaded By", accessor: "admin_id" 
    , render: (row) => row.uploaded_by || "-"
  },
];


export default function DebitNotesView() {
  return (
    <div>
      <PageMeta
        title="Debit Notes - BMI Invoice Management System"
        description="Manage and track all debit notes. View debit note details and associated financial records."
      />
      <ListPage
        resourceName="debitnotes"
        columns={COLUMNS}
        title="Debit Notes"
        addButtonText="New Debit Note"
      />
    </div>
  );
}
