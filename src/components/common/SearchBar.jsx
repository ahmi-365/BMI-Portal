import { useState, useCallback, useEffect } from "react";
import { Search, X } from "lucide-react";

/**
 * SearchBar Component
 * Provides search functionality with debounce
 * Features:
 * - Debounced search input
 * - Clear search button
 * - Loading state
 * - Placeholder text support
 */
export const SearchBar = ({
  onSearch = () => {},
  placeholder = "Search...",
  debounceDelay = 500,
  isLoading = false,
  initialValue = "",
}) => {
  const [searchValue, setSearchValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(searchValue);
      onSearch(searchValue);
    }, debounceDelay);

    return () => clearTimeout(timer);
  }, [searchValue, debounceDelay, onSearch]);

  // Handle clear button
  const handleClear = useCallback(() => {
    setSearchValue("");
    setDebouncedValue("");
    onSearch("");
  }, [onSearch]);

  return (
    <div className="relative w-full max-w-md">
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-5 w-5 text-gray-400 dark:text-gray-600" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder={placeholder}
          disabled={isLoading}
          className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-10 py-2 text-sm font-normal text-gray-700 outline-none transition focus:border-brand-500 active:border-brand-500 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-brand-500"
        />
        {searchValue && (
          <button
            onClick={handleClear}
            disabled={isLoading}
            className="absolute right-3 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed dark:hover:bg-gray-700 dark:hover:text-gray-300"
            title="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
