"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export type PriceTrend = "up" | "down" | "neutral";

interface AnimatedNumberProps {
  value: number;
  className?: string;
  decimals?: number;
  duration?: number;
  formatNumber?: (value: number) => string;
  trend?: PriceTrend;
}

export function AnimatedNumber({
  value,
  className,
  decimals = 0,
  duration = 500,
  formatNumber,
  trend,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const previousValueRef = useRef(value);

  useEffect(() => {
    if (previousValueRef.current === value) return;

    setIsAnimating(true);
    const startValue = previousValueRef.current;
    const endValue = value;
    const startTime = Date.now();

    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out cubic)
      const easeOut = 1 - Math.pow(1 - progress, 3);

      const currentValue = startValue + (endValue - startValue) * easeOut;
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
        setIsAnimating(false);
        previousValueRef.current = endValue;
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  const formattedValue = formatNumber
    ? formatNumber(displayValue)
    : displayValue.toFixed(decimals);

  return (
    <span
      className={cn(
        "tabular-nums transition-all duration-300",
        isAnimating && "scale-150",
        isAnimating && trend === "up" && "text-green-500",
        isAnimating && trend === "down" && "text-red-500",
        className,
      )}
    >
      {formattedValue}
    </span>
  );
}

interface FlipNumberProps {
  value: string | number;
  className?: string;
}

export function FlipNumber({ value, className }: FlipNumberProps) {
  const [currentValue, setCurrentValue] = useState(value.toString());
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    const newValue = value.toString();
    if (newValue !== currentValue) {
      setIsFlipping(true);
      const timer = setTimeout(() => {
        setCurrentValue(newValue);
        setIsFlipping(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [value, currentValue]);

  return (
    <span
      className={cn(
        "inline-block tabular-nums transition-all duration-300",
        isFlipping && "animate-flip",
        className,
      )}
      style={{
        animation: isFlipping ? "flip 0.6s ease-in-out" : undefined,
      }}
    >
      {currentValue}
    </span>
  );
}

interface SplitFlipNumberProps {
  value: number | string;
  className?: string;
  formatNumber?: (value: number) => string;
}

export function SplitFlipNumber({
  value,
  className,
  formatNumber,
}: SplitFlipNumberProps) {
  const formattedValue =
    typeof value === "number" && formatNumber
      ? formatNumber(value)
      : value.toString();

  const digits = formattedValue.split("");

  return (
    <span
      className={cn("inline-flex tabular-nums", className)}
      style={{ perspective: "600px" }}
    >
      {digits.map((digit, index) => (
        <FlipDigit key={index} digit={digit} />
      ))}
    </span>
  );
}

interface FlipDigitProps {
  digit: string;
}

function FlipDigit({ digit }: FlipDigitProps) {
  const [displayDigit, setDisplayDigit] = useState(digit);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (digit !== displayDigit) {
      setIsFlipping(true);

      // Update display digit at the midpoint of the animation
      const updateTimer = setTimeout(() => {
        setDisplayDigit(digit);
      }, 150);

      // Reset flipping state after animation completes
      const resetTimer = setTimeout(() => {
        setIsFlipping(false);
      }, 300);

      return () => {
        clearTimeout(updateTimer);
        clearTimeout(resetTimer);
      };
    }
  }, [digit, displayDigit]);

  return (
    <span className="relative inline-block min-w-[0.6em] text-center">
      <span
        className={cn(
          "inline-block will-change-transform",
          isFlipping && "animate-flip-digit",
        )}
      >
        {displayDigit}
      </span>
    </span>
  );
}
