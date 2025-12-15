/**
 * Format date string to readable format
 * @param {string|Date} date - Date string or Date object
 * @param {object} options - Formatting options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = {}) => {
  if (!date) return "-";

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    // Check if valid date
    if (isNaN(dateObj.getTime())) return "-";

    const {
      format = "short", // 'short', 'long', 'full', 'time', 'datetime'
      locale = "en-US",
    } = options;

    switch (format) {
      case "short":
        // Dec 12, 2025
        return dateObj.toLocaleDateString(locale, {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

      case "long":
        // December 12, 2025
        return dateObj.toLocaleDateString(locale, {
          month: "long",
          day: "numeric",
          year: "numeric",
        });

      case "full":
        // Monday, December 12, 2025
        return dateObj.toLocaleDateString(locale, {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        });

      case "time":
        // 12:00 AM
        return dateObj.toLocaleTimeString(locale, {
          hour: "2-digit",
          minute: "2-digit",
        });

      case "datetime":
        // Dec 12, 2025, 12:00 AM
        return dateObj.toLocaleString(locale, {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

      case "iso":
        // 2025-12-12
        return dateObj.toISOString().split("T")[0];

      default:
        return dateObj.toLocaleDateString(locale);
    }
  } catch (error) {
    console.error("Date formatting error:", error);
    return "-";
  }
};

/**
 * Format date to ISO format (YYYY-MM-DD)
 * @param {string|Date} date - Date string or Date object
 * @returns {string} ISO formatted date
 */
export const formatDateISO = (date) => formatDate(date, { format: "iso" });

/**
 * Format date with time
 * @param {string|Date} date - Date string or Date object
 * @returns {string} Formatted date with time
 */
export const formatDateTime = (date) =>
  formatDate(date, { format: "datetime" });

/**
 * Get relative time (e.g., "2 hours ago", "3 days ago")
 * @param {string|Date} date - Date string or Date object
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return "-";

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    const now = new Date();
    const diffMs = now - dateObj;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffWeek = Math.floor(diffDay / 7);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);

    if (diffSec < 60) return "just now";
    if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
    if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? "s" : ""} ago`;
    if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
    if (diffWeek < 4) return `${diffWeek} week${diffWeek > 1 ? "s" : ""} ago`;
    if (diffMonth < 12)
      return `${diffMonth} month${diffMonth > 1 ? "s" : ""} ago`;
    return `${diffYear} year${diffYear > 1 ? "s" : ""} ago`;
  } catch (error) {
    console.error("Relative time formatting error:", error);
    return "-";
  }
};
