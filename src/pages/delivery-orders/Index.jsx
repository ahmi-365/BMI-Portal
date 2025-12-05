import PageMeta from "../../components/common/PageMeta";
import TabbedResource from "../../components/common/TabbedResource";
import View from "./View";
import Add from "./Add";
import BatchUpload from "./BatchUpload";

export default function DeliveryOrdersIndex() {
  const tabs = [
    { key: "view", label: "View Delivery Order", component: View },
    { key: "add", label: "Add Delivery Order", component: Add },
    { key: "batch", label: "Batch Upload", component: BatchUpload },
  ];

  return (
    <>
      <PageMeta
        title="Delivery Orders - BMI Invoice Management System"
        description="View and manage delivery orders."
      />
      <TabbedResource tabs={tabs} />
    </>
  );
}
