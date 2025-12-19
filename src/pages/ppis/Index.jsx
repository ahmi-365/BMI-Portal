import PageMeta from "../../components/common/PageMeta";
import TabbedResource from "../../components/common/TabbedResource";
import View from "./View";
import Add from "./Add";
import BatchUpload from "./BatchUpload";

export default function PpisIndex() {
  const tabs = [
    { key: "view", label: "View CN PPI", component: View },
    { key: "add", label: "Add CN PPI", component: Add },
    { key: "batch", label: "Batch Upload", component: BatchUpload },
  ];

  return (
    <>
      <PageMeta
        title="CN PPI - BMI Invoice Management System"
        description="View and manage CN PPIs."
      />
      <TabbedResource tabs={tabs} />
    </>
  );
}
