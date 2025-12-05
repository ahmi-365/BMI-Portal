import PageMeta from "../../components/common/PageMeta";
import TabbedResource from "../../components/common/TabbedResource";
import View from "./View";
import Add from "./Add";
import BatchUpload from "./BatchUpload";

export default function InvoicesIndex() {
  const tabs = [
    { key: "view", label: "View Invoices", component: View },
    { key: "add", label: "Add Invoice", component: Add },
    { key: "batch", label: "Batch Upload", component: BatchUpload },
  ];

  return (
    <>
      <PageMeta
        title="Invoices - BMI Invoice Management System"
        description="View and manage invoices."
      />
      <TabbedResource tabs={tabs} />
    </>
  );
}
