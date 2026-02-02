import PageMeta from "../../components/common/PageMeta";
import TabbedResource from "../../components/common/TabbedResource";
import Add from "./Add";
import View from "./View";

export default function CustomersIndex() {
  const tabs = [
    {
      key: "view",
      label: "All Customers",
      component: View,
      permission: "list-customers",
    },
    {
      key: "add",
      label: "Add Customer",
      component: Add,
      permission: "create-customers",
    },
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
