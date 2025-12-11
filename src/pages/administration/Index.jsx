import PageMeta from "../../components/common/PageMeta";
import TabbedResource from "../../components/common/TabbedResource";
import ChangePassword from "./ChangePassword";
import ActivityLogs from "./ActivityLogs";

export default function AdministrationIndex() {
  const tabs = [
    {
      key: "changepassword",
      label: "Change Password",
      component: ChangePassword,
    },
    { key: "activitylogs", label: "Activity Logs", component: ActivityLogs },
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
