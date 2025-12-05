import PageMeta from "../../components/common/PageMeta";
import TabbedResource from "../../components/common/TabbedResource";
import View from "./View";
import Add from "./Add";
import BatchUpload from "./BatchUpload";

export default function AccountStatementsIndex() {
  const tabs = [
    { key: "view", label: "View Statements", component: View },
    { key: "add", label: "Add Statement", component: Add },
    { key: "batch", label: "Batch Upload", component: BatchUpload },
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
