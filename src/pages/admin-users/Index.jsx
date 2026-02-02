import PageMeta from "../../components/common/PageMeta";
import TabbedResource from "../../components/common/TabbedResource";
import AdminCreate from "../admins/AdminCreate";
import AdminView from "../admins/AdminView";

export default function AdminUsersIndex() {
  const tabs = [
    {
      key: "view",
      label: "View Users",
      component: AdminView,
      permission: "list-admins",
    },
    {
      key: "add",
      label: "Add User",
      component: AdminCreate,
      permission: "create-admins",
    },
  ];

  return (
    <>
      <PageMeta
        title="Admin Users - BMI Invoice Management System"
        description="View and manage admin users."
      />
      <TabbedResource tabs={tabs} />
    </>
  );
}
