let _handler = null;

export const setBulkConfirmHandler = (fn) => {
  _handler = fn;
};

export const clearBulkConfirmHandler = () => {
  _handler = null;
};

// payload: { type, message, title, confirmText, onConfirm }
export const openBulkConfirm = (payload = {}) => {
  if (typeof _handler === "function") {
    try {
      _handler(payload);
    } catch (e) {
      console.error("bulkConfirm handler error:", e);
    }
  } else {
    console.warn("No bulkConfirm handler registered");
  }
};

export default {
  setBulkConfirmHandler,
  clearBulkConfirmHandler,
  openBulkConfirm,
};
