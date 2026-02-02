import PageMeta from "../../components/common/PageMeta";
import TabbedResource from "../../components/common/TabbedResource";
import Add from "./Add";
import BatchUpload from "./BatchUpload";
import View from "./View";

export default function PpisIndex() {
  const tabs = [
    {
      key: "view",
      label: "View CN PPI",
      component: View,
      permission: "list-ppis",
    },
    {
      key: "add",
      label: "Add CN PPI",
      component: Add,
      permission: "create-ppis",
    },
    {
      key: "batch",
      label: "Batch Upload",
      component: BatchUpload,
      permission: "create-ppis",
    },
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
