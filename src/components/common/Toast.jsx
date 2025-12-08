import { useEffect } from "react";
import { CheckCircle, AlertCircle, XCircle } from "lucide-react";

export const Toast = ({
  message,
  type = "success",
  duration = 3000,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = {
    success: "bg-green-50 dark:bg-green-900/20",
    error: "bg-red-50 dark:bg-red-900/20",
    info: "bg-blue-50 dark:bg-blue-900/20",
  }[type];

  const borderColor = {
    success: "border-green-200 dark:border-green-900",
    error: "border-red-200 dark:border-red-900",
    info: "border-blue-200 dark:border-blue-900",
  }[type];

  const textColor = {
    success: "text-green-800 dark:text-green-300",
    error: "text-red-800 dark:text-red-300",
    info: "text-blue-800 dark:text-blue-300",
  }[type];

  const iconColor = {
    success: "text-green-600 dark:text-green-400",
    error: "text-red-600 dark:text-red-400",
    info: "text-blue-600 dark:text-blue-400",
  }[type];

  const IconComponent = {
    success: CheckCircle,
    error: XCircle,
    info: AlertCircle,
  }[type];

  return (
    <div
      className={`fixed top-4 right-4 max-w-sm rounded-lg border ${borderColor} ${bgColor} p-4 shadow-lg z-50 animate-fade-in`}
      role="alert"
    >
      <div className="flex items-center gap-3">
        <IconComponent className={`h-5 w-5 flex-shrink-0 ${iconColor}`} />
        <p className={`text-sm font-medium ${textColor}`}>{message}</p>
        <button
          onClick={() => onClose?.()}
          className={`ml-auto text-sm font-medium ${textColor} hover:opacity-75`}
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default Toast;
