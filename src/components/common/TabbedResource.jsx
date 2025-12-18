import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function TabbedResource({
  tabs = [],
  defaultTab = 0,
  basePath,
}) {
  const location = useLocation();
  const navigate = useNavigate();

  // derive basePath from location if not provided
  const pathname = location.pathname;
  const parts = pathname.split("/").filter(Boolean);
  const tabKeys = tabs.map((t) => t.key).filter(Boolean);
  const last = parts[parts.length - 1] || "";

  let resolvedBase = basePath;
  if (!resolvedBase) {
    if (tabKeys.includes(last)) {
      // drop trailing tab key
      const baseParts = parts.slice(0, -1);
      resolvedBase = "/" + baseParts.join("/");
    } else {
      resolvedBase = pathname;
    }
  }

  // determine active index from URL
  const activeFromUrl = tabKeys.indexOf(last);
  const [active, setActive] = useState(
    activeFromUrl >= 0 ? activeFromUrl : defaultTab
  );

  const ActiveComponent = tabs[active] ? tabs[active].component : null;

  const handleTabClick = (t, idx) => {
    setActive(idx);
    // navigate: for 'view' tab use base path, otherwise basePath/<key>
    const key = t.key || "";
    if (!key || key === "view") {
      navigate(resolvedBase || "/");
    } else {
      const to = `${resolvedBase.replace(/\/$/, "")}/${key}`;
      navigate(to);
    }
  };

  return (
    <div className="animate-fade-in-up">
      <div className="border-b border-gray-200 dark:border-gray-700 px-6 pt-4">
        <div className="flex gap-4">
          {tabs.map((t, idx) => (
            <button
              key={t.key || idx}
              onClick={() => handleTabClick(t, idx)}
              className={`pb-3 px-2 text-sm font-medium border-b-2 transition-colors ${
                active === idx
                  ? "border-brand-500 text-brand-500"
                  : "border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 stagger">
        {ActiveComponent ? <ActiveComponent key={active} /> : null}
      </div>
    </div>
  );
}
