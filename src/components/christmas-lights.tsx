"use client";

import { useEffect, useState } from "react";

export function ChristmasLights() {
  const [lights, setLights] = useState<number[]>([]);

  useEffect(() => {
    // Generate positions for lights
    const lightPositions = Array.from({ length: 40 }, (_, i) => i);
    setLights(lightPositions);
  }, []);

  return (
    <div className="absolute sm:top-14 top-10 left-0 right-0 h-16 pointer-events-none z-40 overflow-hidden bg-transparent">
      <svg className="w-full h-full bg-transparent" viewBox="0 0 1000 50">
        {/* Lights */}
        {lights.map((_, i) => {
          const x = (i / lights.length) * 1000;
          const y = 15 + Math.sin(i * 0.5) * 5;
          const colors = [
            "oklch(0.58 0.24 25)", // Red
            "oklch(0.45 0.15 145)", // Green
            "oklch(0.75 0.12 85)", // Gold
            "oklch(0.65 0.18 265)", // Blue
            "oklch(0.7 0.2 350)", // Pink
          ];
          const color = colors[i % colors.length];
          const delay = i * 0.1;

          return (
            <g key={i}>
              {/* Wire connection */}
              <line
                opacity="0.3"
                stroke="oklch(0.3 0.01 145)"
                strokeWidth="1"
                x1={x}
                x2={x}
                y1={y}
                y2={y + 8}
              />
              {/* Light bulb */}
              <circle cx={x} cy={y + 12} fill={color} opacity="0.9" r="4">
                <animate
                  attributeName="opacity"
                  begin={`${delay}s`}
                  dur="2s"
                  repeatCount="indefinite"
                  values="0.5;1;0.5"
                />
              </circle>
              {/* Light glow */}
              <circle cx={x} cy={y + 12} fill={color} opacity="0.3" r="6">
                <animate
                  attributeName="opacity"
                  begin={`${delay}s`}
                  dur="2s"
                  repeatCount="indefinite"
                  values="0.1;0.4;0.1"
                />
                <animate
                  attributeName="r"
                  begin={`${delay}s`}
                  dur="2s"
                  repeatCount="indefinite"
                  values="6;8;6"
                />
              </circle>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
