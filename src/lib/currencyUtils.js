/**
 * Format currency with thousand separators
 * @param {number|string} amount - The currency amount to format
 * @param {object} options - Formatting options
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, options = {}) => {
  if (amount === null || amount === undefined || amount === "") {
    return options.defaultValue || "0";
  }

  try {
    const {
      currency = "MYR", // Currency code (MYR, USD, etc.)
      locale = "en-MY", // Locale for formatting
      decimals = 2, // Number of decimal places
      showSymbol = false, // Whether to show currency symbol
      showCode = false, // Whether to show currency code
      compact = false, // Whether to use compact notation (1.2K, 1.5M)
    } = options;

    // Convert to number if string
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

    // Validate number
    if (isNaN(numAmount)) {
      return options.defaultValue || "0";
    }

    // For compact notation
    if (compact) {
      const absAmount = Math.abs(numAmount);
      const sign = numAmount < 0 ? "-" : "";

      if (absAmount >= 1000000) {
        return `${sign}${(absAmount / 1000000).toFixed(1)}M`;
      } else if (absAmount >= 1000) {
        return `${sign}${(absAmount / 1000).toFixed(1)}K`;
      }
    }

    // Format with thousand separators using toLocaleString
    const formatted = numAmount.toLocaleString(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

    // Add currency symbol or code if requested
    if (showSymbol) {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(numAmount);
    }

    if (showCode) {
      return `${formatted} ${currency}`;
    }

    return formatted;
  } catch (error) {
    console.error("Error formatting currency:", error);
    return options.defaultValue || "0";
  }
};

/**
 * Parse currency string to number
 * @param {string} currencyString - The currency string to parse
 * @returns {number} The numeric value
 */
export const parseCurrency = (currencyString) => {
  if (!currencyString) return 0;
  
  // Remove all non-digit characters except decimal point
  const cleaned = currencyString.replace(/[^\d.-]/g, "");
  return parseFloat(cleaned) || 0;
};

/**
 * Format currency as MYR (Malaysian Ringgit) - common in this app
 * @param {number|string} amount - The amount to format
 * @returns {string} Formatted currency with thousand separators
 */
export const formatMYR = (amount) => {
  return formatCurrency(amount, {
    currency: "MYR",
    locale: "en-MY",
    decimals: 2,
    showCode: true,
  });
};

/**
 * Format currency for display without code
 * @param {number|string} amount - The amount to format
 * @returns {string} Formatted currency with thousand separators
 */
export const formatAmount = (amount) => {
  return formatCurrency(amount, {
    locale: "en-MY",
    decimals: 2,
  });
};
