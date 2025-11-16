"use client";

import { FC, useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const BURN_PERIOD_SECONDS = 24 * 60 * 60; // 24 hours in seconds

interface BurnCountdownTimerProps {
  timeStaked: bigint; // Time staked in seconds (from contract)
  completePeriods: bigint; // Number of complete 24h periods
  className?: string;
}

export const BurnCountdownTimer: FC<BurnCountdownTimerProps> = ({
  timeStaked,
  completePeriods,
  className,
}) => {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [lastTimeStaked, setLastTimeStaked] = useState<bigint>(timeStaked);
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());

  useEffect(() => {
    // Update reference values when timeStaked changes (from contract refetch)
    setLastTimeStaked(timeStaked);
    setLastUpdateTime(Date.now());
  }, [timeStaked]);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      // Calculate elapsed time since last contract update
      const elapsedSinceUpdate = Math.floor(
        (Date.now() - lastUpdateTime) / 1000,
      );

      // Current time staked = last known + elapsed time
      const currentTimeStaked = Number(lastTimeStaked) + elapsedSinceUpdate;

      // Calculate time into current period
      const timeIntoCurrentPeriod = currentTimeStaked % BURN_PERIOD_SECONDS;

      // Calculate time until next period
      const timeUntilNextPeriod = BURN_PERIOD_SECONDS - timeIntoCurrentPeriod;

      setTimeRemaining(Math.max(0, timeUntilNextPeriod));
    };

    calculateTimeRemaining();

    // Update every second for smooth countdown
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [lastTimeStaked, lastUpdateTime]);

  if (timeRemaining === null) {
    return null;
  }

  // Format time remaining
  const formatTimeRemaining = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  return (
    <div className={cn("text-xs text-muted-foreground text-right", className)}>
      Next burn available in:{" "}
      <span className="font-semibold text-orange-500">
        {formatTimeRemaining(timeRemaining)}
      </span>
    </div>
  );
};
