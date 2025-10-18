"use client";

import { useState, useEffect, useCallback } from "react";

export interface TransactionStatus {
  transactionId: string;
  status: "pending" | "success" | "failed" | "cancelled";
  error?: string;
  data?: any;
}

export interface UseTransactionMonitorOptions {
  transactionId: string | null;
  pollInterval?: number; // in milliseconds
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  onStatusChange?: (status: TransactionStatus) => void;
}

export function useTransactionMonitor({
  transactionId,
  pollInterval = 2000, // Poll every 2 seconds
  onSuccess,
  onError,
  onStatusChange,
}: UseTransactionMonitorOptions) {
  const [status, setStatus] = useState<TransactionStatus | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkTransactionStatus = useCallback(async () => {
    if (!transactionId) return;

    try {
      const response = await fetch(
        `/api/transactions/monitor?transactionId=${transactionId}`,
      );
      const data = await response.json();

      if (data.success) {
        const newStatus: TransactionStatus = {
          transactionId: data.transactionId,
          status: data.status,
          error: data.error,
          data: data.data,
        };

        setStatus(newStatus);
        setError(null);
        onStatusChange?.(newStatus);

        // Handle success
        if (data.status === "success") {
          setIsMonitoring(false);
          onSuccess?.(data.data);
        }
        // Handle failure
        else if (data.status === "failed" || data.status === "cancelled") {
          setIsMonitoring(false);
          onError?.(data.error || "Transaction failed");
        }
      } else {
        throw new Error(data.error || "Failed to check transaction status");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      setIsMonitoring(false);
      onError?.(errorMessage);
    }
  }, [transactionId, onSuccess, onError, onStatusChange]);

  const startMonitoring = useCallback(() => {
    if (transactionId && !isMonitoring) {
      setIsMonitoring(true);
      setError(null);
      checkTransactionStatus();
    }
  }, [transactionId, isMonitoring, checkTransactionStatus]);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  // Auto-start monitoring when transactionId is provided
  useEffect(() => {
    if (transactionId && !isMonitoring) {
      startMonitoring();
    }
  }, [transactionId, isMonitoring, startMonitoring]);

  // Polling effect
  useEffect(() => {
    if (!isMonitoring || !transactionId) return;

    const interval = setInterval(() => {
      checkTransactionStatus();
    }, pollInterval);

    return () => clearInterval(interval);
  }, [isMonitoring, transactionId, pollInterval, checkTransactionStatus]);

  return {
    status,
    isMonitoring,
    error,
    startMonitoring,
    stopMonitoring,
    checkTransactionStatus,
  };
}
