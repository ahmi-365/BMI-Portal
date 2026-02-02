import PageMeta from "../../components/common/PageMeta";
import TabbedResource from "../../components/common/TabbedResource";
import Add from "./Add";
import BatchUpload from "./BatchUpload";
import View from "./View";

export default function DebitNotesIndex() {
  const tabs = [
    {
      key: "view",
      label: "View Debit Note",
      component: View,
      permission: "list-debit-notes",
    },
    {
      key: "add",
      label: "Add Debit Note",
      component: Add,
      permission: "create-debit-notes",
    },
    {
      key: "batch",
      label: "Batch Upload",
      component: BatchUpload,
      permission: "create-debit-notes",
    },
  ];

  return (
    <>
      <PageMeta
        title="Debit Notes - BMI Invoice Management System"
        description="View and manage debit notes."
      />
      <TabbedResource tabs={tabs} />
    </>
  );
}
