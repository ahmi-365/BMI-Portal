import PageMeta from "../../components/common/PageMeta";
import TabbedResource from "../../components/common/TabbedResource";
import View from "./View";
import Add from "./Add";
import BatchUpload from "./BatchUpload";

export default function CreditNotesIndex() {
  const tabs = [
    { key: "view", label: "View Credit Note", component: View },
    { key: "add", label: "Add Credit Note", component: Add },
    { key: "batch", label: "Batch Upload", component: BatchUpload },
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
