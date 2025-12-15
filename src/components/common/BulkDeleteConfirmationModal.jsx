import { createPortal } from "react-dom";
import { AlertTriangle } from "lucide-react";

const BulkDeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  count,
}) => {
  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-lg"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800 animate-fadeIn">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-red-100 p-3 dark:bg-red-900/30">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-500" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
            Delete {count} {count === 1 ? "Record" : "Records"}?
          </h3>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            Are you sure you want to delete{" "}
            {count === 1 ? "this record" : `these ${count} records`}? This
            action cannot be undone.
          </p>
          <div className="flex w-full gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? "Deleting..." : "Yes, Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Render modal in portal to ensure it's above all other content
  const modalRoot = document.getElementById("modal-root");
  return modalRoot ? createPortal(modalContent, modalRoot) : modalContent;
};

export default BulkDeleteConfirmationModal;
