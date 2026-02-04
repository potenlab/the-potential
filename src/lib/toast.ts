import { toast as sonnerToast } from "sonner";

/**
 * Toast Notification Utilities
 *
 * Provides easy-to-use toast notification functions using Sonner.
 * All toasts are styled according to The Potential's design system
 * through the customized Toaster wrapper in @/components/ui/sonner.
 *
 * Features:
 * - Auto-dismiss after configurable delay
 * - Dismiss button works
 * - Accessible announcements (via Sonner's built-in ARIA support)
 * - Success, error, warning, info, loading variants
 */

export type ToastOptions = {
  /**
   * Optional description text below the title
   */
  description?: string;

  /**
   * Duration in milliseconds before auto-dismiss (default: 4000)
   */
  duration?: number;

  /**
   * Optional action button
   */
  action?: {
    label: string;
    onClick: () => void;
  };

  /**
   * Optional cancel button
   */
  cancel?: {
    label: string;
    onClick?: () => void;
  };

  /**
   * Callback when toast is dismissed
   */
  onDismiss?: () => void;

  /**
   * Callback when toast auto-closes
   */
  onAutoClose?: () => void;
};

/**
 * Show a success toast notification
 *
 * @example
 * toast.success("Profile updated successfully")
 * toast.success("Post created", { description: "Your post is now visible" })
 */
function success(message: string, options?: ToastOptions) {
  return sonnerToast.success(message, {
    description: options?.description,
    duration: options?.duration ?? 4000,
    action: options?.action
      ? {
          label: options.action.label,
          onClick: () => options.action?.onClick(),
        }
      : undefined,
    cancel: options?.cancel
      ? {
          label: options.cancel.label,
          onClick: () => options.cancel?.onClick?.(),
        }
      : undefined,
    onDismiss: options?.onDismiss,
    onAutoClose: options?.onAutoClose,
  });
}

/**
 * Show an error toast notification
 *
 * @example
 * toast.error("Failed to save changes")
 * toast.error("Network error", { description: "Please check your connection" })
 */
function error(message: string, options?: ToastOptions) {
  return sonnerToast.error(message, {
    description: options?.description,
    duration: options?.duration ?? 5000, // Longer duration for errors
    action: options?.action
      ? {
          label: options.action.label,
          onClick: () => options.action?.onClick(),
        }
      : undefined,
    cancel: options?.cancel
      ? {
          label: options.cancel.label,
          onClick: () => options.cancel?.onClick?.(),
        }
      : undefined,
    onDismiss: options?.onDismiss,
    onAutoClose: options?.onAutoClose,
  });
}

/**
 * Show a warning toast notification
 *
 * @example
 * toast.warning("Your session will expire soon")
 */
function warning(message: string, options?: ToastOptions) {
  return sonnerToast.warning(message, {
    description: options?.description,
    duration: options?.duration ?? 4000,
    action: options?.action
      ? {
          label: options.action.label,
          onClick: () => options.action?.onClick(),
        }
      : undefined,
    cancel: options?.cancel
      ? {
          label: options.cancel.label,
          onClick: () => options.cancel?.onClick?.(),
        }
      : undefined,
    onDismiss: options?.onDismiss,
    onAutoClose: options?.onAutoClose,
  });
}

/**
 * Show an info toast notification
 *
 * @example
 * toast.info("New features available")
 */
function info(message: string, options?: ToastOptions) {
  return sonnerToast.info(message, {
    description: options?.description,
    duration: options?.duration ?? 4000,
    action: options?.action
      ? {
          label: options.action.label,
          onClick: () => options.action?.onClick(),
        }
      : undefined,
    cancel: options?.cancel
      ? {
          label: options.cancel.label,
          onClick: () => options.cancel?.onClick?.(),
        }
      : undefined,
    onDismiss: options?.onDismiss,
    onAutoClose: options?.onAutoClose,
  });
}

/**
 * Show a loading toast notification
 * Returns a function to dismiss the loading toast
 *
 * @example
 * const dismiss = toast.loading("Saving changes...")
 * // After operation completes:
 * dismiss()
 * toast.success("Changes saved!")
 */
function loading(message: string, options?: Omit<ToastOptions, "duration">) {
  const toastId = sonnerToast.loading(message, {
    description: options?.description,
    onDismiss: options?.onDismiss,
  });

  // Return a function to dismiss the loading toast
  return () => sonnerToast.dismiss(toastId);
}

/**
 * Show a loading toast that automatically updates to success/error
 *
 * @example
 * toast.promise(
 *   saveData(),
 *   {
 *     loading: "Saving...",
 *     success: "Saved successfully!",
 *     error: "Failed to save"
 *   }
 * )
 */
function promise<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: Error) => string);
  },
  options?: ToastOptions
) {
  return sonnerToast.promise(promise, {
    loading: messages.loading,
    success: messages.success,
    error: messages.error,
    duration: options?.duration,
  });
}

/**
 * Show a custom toast notification
 *
 * @example
 * toast.custom("Custom message", { duration: 10000 })
 */
function custom(message: string, options?: ToastOptions) {
  return sonnerToast(message, {
    description: options?.description,
    duration: options?.duration ?? 4000,
    action: options?.action
      ? {
          label: options.action.label,
          onClick: () => options.action?.onClick(),
        }
      : undefined,
    cancel: options?.cancel
      ? {
          label: options.cancel.label,
          onClick: () => options.cancel?.onClick?.(),
        }
      : undefined,
    onDismiss: options?.onDismiss,
    onAutoClose: options?.onAutoClose,
  });
}

/**
 * Dismiss a specific toast or all toasts
 *
 * @example
 * toast.dismiss() // Dismiss all
 * toast.dismiss(toastId) // Dismiss specific
 */
function dismiss(toastId?: string | number) {
  sonnerToast.dismiss(toastId);
}

/**
 * Toast notification utilities
 *
 * @example
 * import { toast } from "@/lib/toast";
 *
 * // Success
 * toast.success("Profile updated");
 *
 * // Error with description
 * toast.error("Failed to save", { description: "Please try again" });
 *
 * // Loading with auto-update
 * toast.promise(saveData(), {
 *   loading: "Saving...",
 *   success: "Saved!",
 *   error: "Failed"
 * });
 *
 * // With action button
 * toast.info("New message", {
 *   action: { label: "View", onClick: () => navigate("/messages") }
 * });
 */
export const toast = {
  success,
  error,
  warning,
  info,
  loading,
  promise,
  custom,
  dismiss,
};

export default toast;
