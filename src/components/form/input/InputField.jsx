const Input = ({
  type = "text",
  id,
  name,
  placeholder,
  value,
  onChange,
  className = "",
  min,
  max,
  step,
  disabled = false,
  success = false,
  error = false,
  hint,
}) => {
  let inputClasses = ` h-11 w-full rounded-xl border-2 appearance-none px-4 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:outline-hidden focus:ring-4 transition-all duration-200 bg-white/70 dark:bg-gray-800/70 dark:text-white/90 dark:placeholder:text-white/30 ${className}`;

  if (disabled) {
    inputClasses += ` text-gray-500 border-gray-200 opacity-60 bg-gray-100 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700`;
  } else if (error) {
    inputClasses += ` border-error-500 focus:border-error-400 focus:ring-error-500/20 dark:text-error-300 dark:border-error-600 dark:focus:border-error-700`;
  } else if (success) {
    inputClasses += ` border-success-500 focus:border-success-400 focus:ring-success-500/20 dark:text-success-300 dark:border-success-600 dark:focus:border-success-700`;
  } else {
    inputClasses += ` text-gray-800 border-gray-200 focus:border-brand-400 focus:ring-brand-100 dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-500 dark:focus:ring-brand-900/30 hover:border-gray-300 dark:hover:border-gray-600`;
  }

  return (
    <div className="relative">
      <input
        type={type}
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className={inputClasses}
      />

      {hint && (
        <p
          className={`mt-1.5 text-xs ${
            error
              ? "text-error-500"
              : success
              ? "text-success-500"
              : "text-gray-500"
          }`}
        >
          {hint}
        </p>
      )}
    </div>
  );
};

export default Input;
