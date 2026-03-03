import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const rows = await prisma.siteSettings.findMany({
      where: { key: { in: ["cornerStyle", "themeColor"] } },
    });
    const map: Record<string, string> = {};
    for (const r of rows) map[r.key] = r.value;
    return NextResponse.json({
      cornerStyle: map.cornerStyle || "rounded",
      themeColor: map.themeColor || "blue",
    });
  } catch {
    return NextResponse.json({
      cornerStyle: "rounded",
      themeColor: "blue",
    });
  }
}
