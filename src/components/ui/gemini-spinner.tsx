"use client";

import { cn } from "@/lib/utils";

const COLORS = ["#8B5CF6", "#06B6D4", "#F59E0B", "#EC4899"];
const L = 2 * Math.PI * 10;
const SEG = L / 4;

/**
 * Gemini 스타일 멀티컬러 로딩 스피너
 * 파랑·초록·노랑·빨강 4색 세그먼트
 */
export function GeminiSpinner({ className }: { className?: string }) {
  return (
    <div
      className={cn("relative inline-block", className)}
      role="status"
      aria-label="로딩 중"
    >
      <svg
        className="size-full animate-spin"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {COLORS.map((color, i) => (
          <circle
            key={color}
            cx="12"
            cy="12"
            r="10"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${SEG - 2} ${L - SEG + 2}`}
            strokeDashoffset={-(i * SEG)}
          />
        ))}
      </svg>
    </div>
  );
}
