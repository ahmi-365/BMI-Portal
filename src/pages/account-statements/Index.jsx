import PageMeta from "../../components/common/PageMeta";
import TabbedResource from "../../components/common/TabbedResource";
import Add from "./Add";
import BatchUpload from "./BatchUpload";
import View from "./View";

export default function AccountStatementsIndex() {
  const tabs = [
    {
      key: "view",
      label: "View Statements",
      component: View,
      permission: "list-statements",
    },
    {
      key: "add",
      label: "Add Statement",
      component: Add,
      permission: "create-statements",
    },
    {
      key: "batch",
      label: "Batch Upload",
      component: BatchUpload,
      permission: "create-statements",
    },
  ];

  return (
    <>
      <PageMeta
        title="Account Statements - BMI Invoice Management System"
        description="View and manage account statements."
      />
      <TabbedResource tabs={tabs} />
    </>
  );
}
