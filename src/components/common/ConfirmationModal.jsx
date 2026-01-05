import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm",
  message = "Are you sure?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
  // When true, shows an acknowledgement checkbox that must be checked before confirming
  requireAcknowledgement = false,
  // Default acknowledgement text shown next to the checkbox
  acknowledgementText =
    "I acknowledge that amounts are converted to MYR and I have read and accept the Bribery Act / Code of Conduct.",
}) => {
  if (!isOpen) return null;

  const [ackChecked, setAckChecked] = useState(false);

  useEffect(() => {
    if (isOpen) setAckChecked(false);
  }, [isOpen]);

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />

      <div
        className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center">
          <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">{message}</p>
          {requireAcknowledgement && (
            <label
              className="mb-4 flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="checkbox"
                checked={ackChecked}
                onChange={(e) => {
                  e.stopPropagation();
                  setAckChecked(e.target.checked);
                }}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="text-left">{acknowledgementText}</span>
            </label>
          )}
          <div className="flex w-full gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading || (requireAcknowledgement && !ackChecked)}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? `${confirmText}...` : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const modalRoot = document.getElementById("modal-root");
  return modalRoot ? createPortal(modalContent, modalRoot) : modalContent;
};

export default ConfirmationModal;
