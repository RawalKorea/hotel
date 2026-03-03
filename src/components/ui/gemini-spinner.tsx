"use client";

import { cn } from "@/lib/utils";

const SEGMENTS = [
  { color: "#4285F4", offset: 0 },   // 파랑
  { color: "#34A853", offset: 90 },   // 초록
  { color: "#FBBC05", offset: 180 },  // 노랑
  { color: "#EA4335", offset: 270 },  // 빨강
];

/**
 * Gemini 스타일 멀티컬러 로딩 스피너
 * 여러 색상 부위가 나뉘어 돌아가는 형태
 */
export function GeminiSpinner({ className }: { className?: string }) {
  const r = 10;
  const cx = 12;
  const cy = 12;

  const describeArc = (startAngle: number, sweep: number) => {
    const start = (startAngle * Math.PI) / 180;
    const end = ((startAngle + sweep) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    const large = sweep > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  };

  return (
    <div
      className={cn("relative", className)}
      role="status"
      aria-label="로딩 중"
    >
      <svg
        className="size-full animate-spin"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {SEGMENTS.map((seg, i) => (
          <path
            key={i}
            d={describeArc(seg.offset, 72)}
            stroke={seg.color}
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        ))}
      </svg>
    </div>
  );
}
