import PageMeta from "../../components/common/PageMeta";
import TabbedResource from "../../components/common/TabbedResource";
import Add from "./Add";
import BatchUpload from "./BatchUpload";
import View from "./View";

export default function DeliveryOrdersIndex() {
  const tabs = [
    {
      key: "view",
      label: "View Delivery Order",
      component: View,
      permission: "list-delivery-orders",
    },
    {
      key: "add",
      label: "Add Delivery Order",
      component: Add,
      permission: "create-delivery-orders",
    },
    {
      key: "batch",
      label: "Batch Upload",
      component: BatchUpload,
      permission: "create-delivery-orders",
    },
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
