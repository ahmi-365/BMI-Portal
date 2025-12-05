import PageMeta from "../../components/common/PageMeta";
import TabbedResource from "../../components/common/TabbedResource";
import View from "./View";
import Add from "./Add";
import BatchUpload from "./BatchUpload";

export default function CustomersIndex() {
  const tabs = [
    { key: "view", label: "View Customers", component: View },
    { key: "add", label: "Add Customer", component: Add },
    { key: "batch", label: "Batch Upload", component: BatchUpload },
  ];

  return (
    <>
      <PageMeta
        title="Customers - BMI Invoice Management System"
        description="View and manage customers."
      />
      <TabbedResource tabs={tabs} />
    </>
  );
}
