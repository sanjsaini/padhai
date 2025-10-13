import { toast } from "react-toastify";

const baseOptions = {
  position: "top-center",
};

export const showSuccess = (message) =>
  toast.success(message, {
    ...baseOptions,
    icon: "✅",
    progressStyle: { background: "#10b981" },
  });

export const showError = (message) =>
  toast.error(message, {
    ...baseOptions,
    icon: "❌",
    progressStyle: { background: "#ef4444" },
  });

export const showInfo = (message) =>
  toast.info(message, {
    ...baseOptions,
    icon: "ℹ️",
    progressStyle: { background: "#3b82f6" },
  });

export const showWarning = (message) =>
  toast.warn(message, {
    ...baseOptions,
    icon: "⚠️",
    progressStyle: { background: "#f59e0b" },
  });
