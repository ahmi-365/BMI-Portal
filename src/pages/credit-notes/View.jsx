import { ListPage } from "../../components/common/ListPage";
import PageMeta from "../../components/common/PageMeta";

const COLUMNS = [
  { header: "Customer No.", accessor: "customerNo" },
  { header: "Company Name", accessor: "companyName" },
  { header: "CN No.", accessor: "cnNo" },
  { header: "DO No.", accessor: "doNo" },
  { header: "CN Doc", accessor: "cnDoc" },
  { header: "DO Doc", accessor: "doDoc" },
  { header: "CN Date", accessor: "cnDate" },
  { header: "PO No.", accessor: "poNo" },
  { header: "Ref No.", accessor: "refNo" },
  { header: "Amount", accessor: "amount" },
  { header: "Uploaded at", accessor: "uploadedAt" },
  { header: "Uploaded By", accessor: "uploadedBy" },
];

export default function CreditNotesView() {
  return (
    <ListPage
      resourceName="credit-notes"
      columns={COLUMNS}
      title="Credit Notes"
      addButtonText="New Credit Note"
    />
  );
}
