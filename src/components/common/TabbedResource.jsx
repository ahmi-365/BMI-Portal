import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { canAccess } from "../../lib/permissionHelper";

export default function TabbedResource({
  tabs = [],
  defaultTab = 0,
  basePath,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const allowedTabs = useMemo(
    () => tabs.filter((t) => canAccess(t.permission)),
    [tabs],
  );

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

  // determine active index from URL (after permissions)
  const allowedTabKeys = allowedTabs.map((t) => t.key).filter(Boolean);
  const viewIndex = allowedTabs.findIndex((t) => !t.key || t.key === "view");
  const activeFromUrl = allowedTabKeys.indexOf(last);
  const activeIndex = useMemo(
    () =>
      activeFromUrl >= 0
        ? activeFromUrl
        : viewIndex >= 0
          ? viewIndex
          : Math.min(defaultTab, Math.max(allowedTabs.length - 1, 0)),
    [activeFromUrl, viewIndex, defaultTab, allowedTabs.length],
  );

  const ActiveComponent = allowedTabs[activeIndex]
    ? allowedTabs[activeIndex].component
    : null;

  useEffect(() => {
    if (!allowedTabs.length) return;

    const isTabKey = tabKeys.includes(last);
    const isAllowedKey = allowedTabKeys.includes(last);

    if (isTabKey && !isAllowedKey) {
      const first = allowedTabs[0];
      const key = first?.key || "";
      if (!key || key === "view") {
        navigate(resolvedBase || "/", { replace: true });
      } else {
        const to = `${resolvedBase.replace(/\/$/, "")}/${key}`;
        navigate(to, { replace: true });
      }
    } else if (isAllowedKey) {
      // URL already points to an allowed tab
    } else if (viewIndex >= 0) {
      // base path or unknown tab; show view tab by default
    }
  }, [
    allowedTabs,
    allowedTabKeys,
    last,
    navigate,
    resolvedBase,
    tabKeys,
    viewIndex,
  ]);

  const handleTabClick = (t) => {
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
          {allowedTabs.map((t, idx) => (
            <button
              key={t.key || idx}
              onClick={() => handleTabClick(t)}
              className={`pb-3 px-2 text-sm font-medium border-b-2 transition-colors ${
                activeIndex === idx
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
        {ActiveComponent ? (
          <ActiveComponent key={activeIndex} />
        ) : (
          <div className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
            You do not have permission to access this section.
          </div>
        )}
      </div>
    </div>
  );
}
