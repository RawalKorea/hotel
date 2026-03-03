import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const rows = await prisma.siteSettings.findMany({
      where: { key: { in: ["cornerStyle", "themeColor", "eventCarouselMode"] } },
    });
    const map: Record<string, string> = {};
    for (const r of rows) map[r.key] = r.value;
    return NextResponse.json({
      cornerStyle: map.cornerStyle || "rounded",
      themeColor: map.themeColor || "blue",
      eventCarouselMode: map.eventCarouselMode || "smooth",
    });
  } catch {
    return NextResponse.json({
      cornerStyle: "rounded",
      themeColor: "blue",
      eventCarouselMode: "smooth",
    });
  }
}
