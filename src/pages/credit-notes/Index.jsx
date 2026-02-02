import PageMeta from "../../components/common/PageMeta";
import TabbedResource from "../../components/common/TabbedResource";
import Add from "./Add";
import BatchUpload from "./BatchUpload";
import View from "./View";

export default function CreditNotesIndex() {
  const tabs = [
    {
      key: "view",
      label: "View Credit Note",
      component: View,
      permission: "list-credit-notes",
    },
    {
      key: "add",
      label: "Add Credit Note",
      component: Add,
      permission: "create-credit-notes",
    },
    {
      key: "batch",
      label: "Batch Upload",
      component: BatchUpload,
      permission: "create-credit-notes",
    },
  ];

  return (
    <>
      <PageMeta
        title="Credit Notes - BMI Invoice Management System"
        description="View and manage credit notes."
      />
      <TabbedResource tabs={tabs} />
    </>
  );
}
