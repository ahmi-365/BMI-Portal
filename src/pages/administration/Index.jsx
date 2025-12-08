import PageMeta from "../../components/common/PageMeta";
import TabbedResource from "../../components/common/TabbedResource";
import View from "./View";
import Add from "./Add";

export default function AdministrationIndex() {
  const tabs = [
    { key: "view", label: "Change Password", component: View },
    { key: "add", label: "System Logs", component: Add },
  ];

  return (
    <>
      <PageMeta
        title="Administration - BMI Invoice Management System"
        description="View and manage administration settings."
      />
      <TabbedResource tabs={tabs} />
    </>
  );
}
