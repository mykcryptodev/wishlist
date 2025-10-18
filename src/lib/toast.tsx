"use client";

import { toast } from "sonner";

export function showLoadingToast(message: string, description?: string) {
  return toast.loading(message, {
    description,
    duration: Infinity,
  });
}

export function showSuccessToast(message: string, description?: string) {
  return toast.success(message, {
    description,
    duration: 5000,
  });
}

export function showErrorToast(message: string, description?: string) {
  return toast.error(message, {
    description,
    duration: 5000,
  });
}
