import PageMeta from "../../components/common/PageMeta";
import TabbedResource from "../../components/common/TabbedResource";
import View from "./View";
import Add from "./Add";
import BatchUpload from "./BatchUpload";

export default function DebitNotesIndex() {
  const tabs = [
    { key: "view", label: "View Debit Note", component: View },
    { key: "add", label: "Add Debit Note", component: Add },
    { key: "batch", label: "Batch Upload", component: BatchUpload },
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
