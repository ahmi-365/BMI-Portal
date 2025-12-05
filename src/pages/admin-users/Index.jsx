import PageMeta from "../../components/common/PageMeta";
import TabbedResource from "../../components/common/TabbedResource";
import AdminView from "../admins/AdminView";
import AdminCreate from "../admins/AdminCreate";
import BatchUpload from "./BatchUpload";

export default function AdminUsersIndex() {
  const tabs = [
    { key: "view", label: "View Users", component: AdminView },
    { key: "add", label: "Add User", component: AdminCreate },
    { key: "batch", label: "Batch Upload", component: BatchUpload },
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
