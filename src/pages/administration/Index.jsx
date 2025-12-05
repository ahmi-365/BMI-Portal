import TabbedResource from "../../components/common/TabbedResource";
import View from "./View";
import Add from "./Add";

export default function AdministrationIndex() {
  const tabs = [
    { key: "view", label: "View Administration", component: View },
    { key: "add", label: "Add Administration", component: Add },
  ];

  return <TabbedResource tabs={tabs} />;
}
