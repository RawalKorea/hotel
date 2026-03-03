"use client";

import { GeminiSpinner } from "@/components/ui/gemini-spinner";

/**
 * 전체 화면 어두운 오버레이 + 화면 가운데 로딩 스피너
 */
export function LoadingOverlay() {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-[1px]"
      role="status"
      aria-live="polite"
      aria-label="로딩 중"
    >
      <GeminiSpinner className="h-12 w-12" />
    </div>
  );
}
