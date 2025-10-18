"use client";

import { toast } from "sonner";

export function showLoadingToast(message: string, description?: string) {
  return toast.loading(message, {
    description,
    duration: Infinity, // Loading toasts should not auto-dismiss
  });
}

export function showSuccessToast(
  message: string,
  description?: string,
  toastId?: string | number,
) {
  return toast.success(message, {
    id: toastId, // If toastId is provided, it will replace the existing toast
    description,
    duration: 5000,
  });
}

export function showErrorToast(
  message: string,
  description?: string,
  toastId?: string | number,
) {
  return toast.error(message, {
    id: toastId, // If toastId is provided, it will replace the existing toast
    description,
    duration: 5000,
  });
}

export function dismissToast(toastId: string | number) {
  toast.dismiss(toastId);
}
