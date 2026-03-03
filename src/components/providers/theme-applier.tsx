"use client";

import { useEffect } from "react";

export function ThemeApplier() {
  useEffect(() => {
    fetch("/api/settings/theme")
      .then((r) => r.json())
      .then(({ cornerStyle, themeColor }) => {
        const root = document.documentElement;
        root.setAttribute("data-corner", cornerStyle === "sharp" ? "sharp" : "rounded");
        root.setAttribute("data-theme", themeColor || "blue");
      })
      .catch(() => {
        document.documentElement.setAttribute("data-corner", "rounded");
        document.documentElement.setAttribute("data-theme", "blue");
      });
  }, []);
  return null;
}
