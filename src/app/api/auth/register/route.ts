import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema, adminRegisterSchema } from "@/lib/validations/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const isAdmin = body.securityCode !== undefined;

    if (isAdmin) {
      const parsed = adminRegisterSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.issues[0].message },
          { status: 400 }
        );
      }

      if (parsed.data.securityCode !== process.env.ADMIN_SECURITY_CODE) {
        return NextResponse.json(
          { error: "유효하지 않은 보안 코드입니다." },
          { status: 403 }
        );
      }

      const exists = await prisma.user.findUnique({
        where: { email: parsed.data.email },
      });
      if (exists) {
        return NextResponse.json(
          { error: "이미 등록된 이메일입니다." },
          { status: 409 }
        );
      }

      const hashedPassword = await bcrypt.hash(parsed.data.password, 12);

      const user = await prisma.user.create({
        data: {
          name: parsed.data.name,
          email: parsed.data.email,
          phone: parsed.data.phone || null,
          password: hashedPassword,
          role: "SUPER_ADMIN",
        },
      });

      return NextResponse.json(
        { message: "관리자 계정이 생성되었습니다.", userId: user.id },
        { status: 201 }
      );
    }

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = parsed.data;

    if (data.accountType === "email") {
      const exists = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (exists) {
        return NextResponse.json(
          { error: "이미 등록된 이메일입니다." },
          { status: 409 }
        );
      }

      const hashedPassword = await bcrypt.hash(data.password, 12);

      await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          password: hashedPassword,
          role: "USER",
        },
      });
    } else {
      const exists = await prisma.user.findUnique({
        where: { username: data.username },
      });
      if (exists) {
        return NextResponse.json(
          { error: "이미 사용 중인 아이디입니다." },
          { status: 409 }
        );
      }

      const hashedPassword = await bcrypt.hash(data.password, 12);

      await prisma.user.create({
        data: {
          name: data.name,
          username: data.username,
          phone: data.phone || null,
          password: hashedPassword,
          role: "USER",
        },
      });
    }

    return NextResponse.json(
      { message: "회원가입이 완료되었습니다." },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
