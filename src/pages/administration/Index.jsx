import PageMeta from "../../components/common/PageMeta";
import TabbedResource from "../../components/common/TabbedResource";
import ExportReport from "../reports/ExportReport";
import ActivityLogs from "./ActivityLogs";
import ChangePassword from "./ChangePassword";
import RolesIndex from "./roles/Index";

export default function AdministrationIndex() {
  const tabs = [
    {
      key: "changepassword",
      label: "Change Password",
      component: ChangePassword,
      permission: "list-roles",
    },
    {
      key: "activitylogs",
      label: "Activity Logs",
      component: ActivityLogs,
      permission: "list-roles",
    },
    {
      key: "exportreports",
      label: "Export Reports",
      component: ExportReport,
      permission: "list-roles",
    },
    {
      key: "roles",
      label: "Roles & Permissions",
      component: RolesIndex,
      permission: "list-roles",
    },
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
