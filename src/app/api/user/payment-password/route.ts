import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, password } = body; // action: "set" | "verify"

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "비밀번호를 입력해주세요." },
        { status: 400 }
      );
    }

    const pw = password.replace(/\D/g, "");
    if (pw.length < 4 || pw.length > 6) {
      return NextResponse.json(
        { error: "결제 비밀번호는 4~6자리 숫자여야 합니다." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { paymentPassword: true },
    });

    if (action === "set") {
      if (user?.paymentPassword) {
        return NextResponse.json(
          { error: "이미 결제 비밀번호가 설정되어 있습니다." },
          { status: 400 }
        );
      }
      const hash = await bcrypt.hash(pw, 10);
      await prisma.user.update({
        where: { id: session.user.id },
        data: { paymentPassword: hash },
      });
      return NextResponse.json({ success: true });
    }

    if (action === "verify") {
      if (!user?.paymentPassword) {
        return NextResponse.json(
          { error: "결제 비밀번호가 설정되어 있지 않습니다." },
          { status: 400 }
        );
      }
      const valid = await bcrypt.compare(pw, user.paymentPassword);
      if (!valid) {
        return NextResponse.json(
          { error: "결제 비밀번호가 일치하지 않습니다." },
          { status: 401 }
        );
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  } catch {
    return NextResponse.json(
      { error: "처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
