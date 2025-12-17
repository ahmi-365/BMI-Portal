import { ShowPage } from "../../components/common/ShowPage";
import FileDownloadButton from "../../components/common/FileDownloadButton";

const FIELDS = [
  // { name: "id", label: "ID" },
  { name: "customer_no", label: "Customer No" },
  {
    name: "user",
    label: "Company Name",
    render: (user) => user?.company || "-",
  },
  { name: "statement_doc", label: "Statement Document", type: "file",
    render: (_v,row) => (
              <FileDownloadButton
                file={row.statement_doc}
                id={row.id}
                endpoint="statements"
                path="download"
              />
            ),
   },
  { name: "statement_date", label: "Statement Date",
    render: (value) => (value ? String(value).split("T")[0] : "-"),
   },
  // { name: "updated_at", label: "Updated At",
  //   render: (value) => (value ? String(value).split("T")[0] : "-"),
  //  },
  // {
  //   name: "user",
  //   label: "Uploaded By",
  //   render: (user, data) => data.admin?.name || user?.name || "-",
  // },
];

export default function AccountStatementsShow() {
  return (
    <ShowPage
      resourceName="statements"
      fields={FIELDS}
      title="Account Statement"
    />
  );
}
