import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DANGER_KEYS = [
  "enableUserBlock",
  "enableFriends",
  "enableMessenger",
  "enableGroupMessenger",
  "enableFamilySettings",
  "allowDeleteOwnAccount",
  "enablePartnersAccount",
] as const;

export async function GET() {
  const session = await auth();
  if (!session?.user || !["SUPER_ADMIN", "STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await prisma.siteSettings.findMany({
    where: { key: { in: [...DANGER_KEYS] } },
  });
  const settings: Record<string, string> = {};
  for (const r of rows) settings[r.key] = r.value;

  const defaults: Record<string, string> = {
    enableUserBlock: "true",
    enableFriends: "false",
    enableMessenger: "false",
    enableGroupMessenger: "false",
    enableFamilySettings: "false",
    allowDeleteOwnAccount: "true",
    enablePartnersAccount: "false",
  };

  return NextResponse.json({ ...defaults, ...settings });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user || !["SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "최고관리자만 수정할 수 있습니다." }, { status: 403 });
  }

  try {
    const body = (await req.json()) as Record<string, string>;
    for (const key of DANGER_KEYS) {
      const val = String(body[key] ?? "").toLowerCase();
      const value = val === "true" || val === "1" ? "true" : "false";
      await prisma.siteSettings.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "설정 저장 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
