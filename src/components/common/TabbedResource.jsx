import { useState } from "react";

export default function TabbedResource({ tabs = [], defaultTab = 0 }) {
  const [active, setActive] = useState(defaultTab);
  const ActiveComponent = tabs[active] ? tabs[active].component : null;

  return (
    <div>
      <div className="border-b border-gray-200 dark:border-gray-700 px-6 pt-4">
        <div className="flex gap-4">
          {tabs.map((t, idx) => (
            <button
              key={t.key || idx}
              onClick={() => setActive(idx)}
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

      <div className="mt-4">{ActiveComponent ? <ActiveComponent /> : null}</div>
    </div>
  );
}
