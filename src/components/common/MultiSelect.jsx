import { ChevronDown, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function MultiSelect({
  options = [],
  value = [],
  onChange,
  placeholder = "Select options...",
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  // New state to toggle expanding the tags inside the input
  const [showAllTags, setShowAllTags] = useState(false);
  
  const containerRef = useRef(null);

  const selectedOptions = options.filter((opt) => value.includes(opt.value));

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(query.toLowerCase())
  );

  // How many tags to show before truncating
  const VISIBLE_TAGS_LIMIT = 2;

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

  // Determine which tags to display based on state
  const displayedTags = showAllTags 
    ? selectedOptions 
    : selectedOptions.slice(0, VISIBLE_TAGS_LIMIT);
  
  const hiddenCount = selectedOptions.length - VISIBLE_TAGS_LIMIT;

  return (
    <div ref={containerRef} className="relative">
      <div
        className="w-full min-h-[42px] px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white cursor-pointer flex items-center justify-between"
        onClick={() => setOpen(!open)}
      >
        <div className="flex flex-wrap gap-1 flex-1 items-center">
          {selectedOptions.length > 0 ? (
            <>
              {displayedTags.map((opt) => (
                <span
                  key={opt.value}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-xs rounded-full"
                  onClick={(e) => e.stopPropagation()} // Prevent opening dropdown when clicking a tag
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
              ))}

              {/* Show More / Show Less Toggle */}
              {selectedOptions.length > VISIBLE_TAGS_LIMIT && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent opening the dropdown
                    setShowAllTags(!showAllTags);
                  }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-500 hover:underline dark:text-blue-400 ml-1 whitespace-nowrap"
                >
                  {showAllTags ? "Show Less" : `+ ${hiddenCount} more`}
                </button>
              )}
            </>
          ) : (
            <span className="text-gray-500 dark:text-gray-400">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full min-w-[300px] bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
          <input
            type="text"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-3 py-2 border-b border-gray-200 dark:border-gray-700  text-gray-900 dark:text-white outline-none sticky top-0 bg-white dark:bg-gray-800 z-10"
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
          <div className="py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
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
              ))
            ) : (
               <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                 No options found.
               </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}