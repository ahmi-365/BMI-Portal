import { ShowPage } from "../../components/common/ShowPage";
import FileDownloadButton from "../../components/common/FileDownloadButton";

const FIELDS = [
  { name: "id", label: "ID" },
  { name: "customer_no", label: "Customer No." },
  { name: "user.company", label: "Company Name",
    render: (_v, row) => row.user?.company ?? "-",
   },   // nested field
  { name: "cn_no", label: "CN No." },
  { name: "cn_doc", label: "CN Document" ,
    render: (_v,row) => (
              <FileDownloadButton
                file={row.cn_doc}
                id={row.id}
                endpoint="creditnotes"
                path="download"
              />
            ),
  },
  { name: "cn_date", label: "CN Date" ,
    render: (value) => value ? String(value).split("T")[0] : "-"
  },
  { name: "po_no", label: "PO No." },
  { name: "ref_no", label: "Ref No." },
  { name: "amount", label: "Amount" },
  { name: "remarks", label: "Remarks" },
  { name: "payment_term", label: "Payment Term",
    render: (value) => value ? value.split("T")[0] : "-"
   },
  { name: "created_at", label: "Uploaded At",
    render: (value) => value ? String(value).split("T")[0] : "-"
   },
  { name: "admin_id", label: "Uploaded By",
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
