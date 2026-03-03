import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DEFAULT_KEYS = [
  "siteName",
  "siteDescription",
  "contactEmail",
  "contactPhone",
  "address",
  "businessHours",
  "checkInTime",
  "checkOutTime",
  "cancellationPolicy",
  "footerText",
  "aboutContent",
  "faqContent",
  "termsContent",
  "privacyContent",
] as const;

export async function GET() {
  const session = await auth();
  if (!session?.user || !["SUPER_ADMIN", "STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await prisma.siteSettings.findMany();
  const settings: Record<string, string> = {};
  for (const row of rows) {
    settings[row.key] = row.value;
  }
  for (const key of DEFAULT_KEYS) {
    if (!(key in settings)) settings[key] = "";
  }

  return NextResponse.json(settings);
}

export async function PUT(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  try {
    const body = await req.json() as Record<string, string>;

    for (const [key, value] of Object.entries(body)) {
      if (typeof value !== "string") continue;
      await prisma.siteSettings.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      });
    }

    const rows = await prisma.siteSettings.findMany();
    const settings: Record<string, string> = {};
    for (const row of rows) {
      settings[row.key] = row.value;
    }

    return NextResponse.json(settings);
  } catch {
    return NextResponse.json(
      { error: "설정 저장 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
