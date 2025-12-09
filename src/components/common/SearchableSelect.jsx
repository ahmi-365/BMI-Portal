import { useState, useRef, useEffect } from "react";

export default function SearchableSelect({
  options = [],
  value,
  onChange,
  placeholder = "",
  disabled = false,
  id,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const containerRef = useRef(null);

  // Map value to label for display
  const selected = options.find((o) => String(o.value) === String(value));
  const displayLabel = selected ? selected.label : query;

  // Filter options by query
  const filtered = query
    ? options.filter(
        (o) =>
          o.label.toLowerCase().includes(query.toLowerCase()) ||
          String(o.value).toLowerCase().includes(query.toLowerCase())
      )
    : options;

  useEffect(() => {
    const onDocClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setHighlight(0);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  useEffect(() => {
    // Keep highlight in range
    if (highlight >= filtered.length)
      setHighlight(Math.max(0, filtered.length - 1));
  }, [filtered, highlight]);

  const handleInput = (e) => {
    setQuery(e.target.value);
    setOpen(true);
    setHighlight(0);
  };

  const handleSelect = (opt) => {
    onChange && onChange(opt.value);
    setQuery("");
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(filtered.length - 1, h + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(0, h - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (open && filtered[highlight]) {
        handleSelect(filtered[highlight]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={`list-${id}`}
        placeholder={placeholder}
        value={displayLabel || query}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={() => setOpen(true)}
        disabled={disabled}
        className="w-full rounded-lg border border-gray-300 bg-transparent px-5 py-3 text-black outline-none transition focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
      />

      {open && filtered.length > 0 && (
        <ul
          id={`list-${id}`}
          role="listbox"
          className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-md border bg-white shadow-lg dark:bg-gray-800 dark:border-gray-700"
        >
          {filtered.map((opt, idx) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={String(opt.value) === String(value)}
              onMouseDown={(e) => {
                // onMouseDown so selection happens before blur
                e.preventDefault();
                handleSelect(opt);
              }}
              onMouseEnter={() => setHighlight(idx)}
              className={`px-4 py-2 cursor-pointer ${
                idx === highlight
                  ? "bg-brand-100 text-brand-700 dark:bg-brand-500/10"
                  : "text-gray-700 dark:text-gray-200"
              }`}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
