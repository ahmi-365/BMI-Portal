import PageMeta from "../../components/common/PageMeta";
import TabbedResource from "../../components/common/TabbedResource";
import Add from "./Add";
import View from "./View";

export default function AnnouncementsIndex() {
  const tabs = [
    {
      key: "view",
      label: "View Announcements",
      component: View,
    },
    {
      key: "add",
      label: "Add Announcement",
      component: Add,
    },
  ];

  return (
    <>
      <PageMeta
        title="Announcements - BMI Invoice Management System"
        description="Create, manage, and review announcements."
      />
      <TabbedResource tabs={tabs} />
    </>
  );
}
