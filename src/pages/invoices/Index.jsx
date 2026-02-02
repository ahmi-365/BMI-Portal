import PageMeta from "../../components/common/PageMeta";
import TabbedResource from "../../components/common/TabbedResource";
import Add from "./Add";
import BatchUpload from "./BatchUpload";
import View from "./View";

export default function InvoicesIndex() {
  const tabs = [
    {
      key: "view",
      label: "View Invoices",
      component: View,
      permission: "list-invoices",
    },
    {
      key: "add",
      label: "Add Invoice",
      component: Add,
      permission: "create-invoices",
    },
    {
      key: "batch",
      label: "Batch Upload",
      component: BatchUpload,
      permission: "create-invoices",
    },
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
