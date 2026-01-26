import { useState, useRef, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";

export default function MultiSelect({
  options = [],
  value = [],
  onChange,
  placeholder = "Select options...",
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef(null);

  const selectedOptions = options.filter((opt) => value.includes(opt.value));

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const onDocClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const handleSelect = (opt) => {
    const newValue = value.includes(opt.value)
      ? value.filter((v) => v !== opt.value)
      : [...value, opt.value];
    onChange(newValue);
  };

  const handleRemove = (optValue) => {
    onChange(value.filter((v) => v !== optValue));
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        className="w-full min-h-[42px] px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white cursor-pointer flex items-center justify-between"
        onClick={() => setOpen(!open)}
      >
        <div className="flex flex-wrap gap-1 flex-1">
          {selectedOptions.length > 0 ? (
            selectedOptions.map((opt) => (
              <span
                key={opt.value}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-xs rounded-full"
              >
                {opt.label}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(opt.value);
                  }}
                  className="hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          ) : (
            <span className="text-gray-500 dark:text-gray-400">{placeholder}</span>
          )}
        </div>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full min-w-[300px] bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
          <input
            type="text"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white outline-none"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="py-1">
            {filteredOptions.map((opt) => (
              <div
                key={opt.value}
                onClick={() => handleSelect(opt)}
                className={`px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  value.includes(opt.value)
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300"
                    : "text-gray-900 dark:text-white"
                }`}
              >
                {opt.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}