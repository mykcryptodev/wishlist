"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const LoadingDescription = ({ description }: { description: string }) => (
  <div className="flex items-center gap-2">
    <Loader2 className="h-4 w-4 animate-spin" />
    <span>{description}</span>
  </div>
);

export function showLoadingToast(message: string, description?: string) {
  return toast.info(message, {
    description: description ? <LoadingDescription description={description} /> : undefined,
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
