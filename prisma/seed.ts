import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@staynest.local";
  const adminPassword = "Admin123!";
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const existing = await prisma.user.findFirst({
    where: { role: "SUPER_ADMIN" },
  });

  if (existing) {
    console.log("관리자 계정이 이미 존재합니다.");
    return;
  }

  await prisma.user.create({
    data: {
      name: "관리자",
      email: adminEmail,
      password: hashedPassword,
      role: "SUPER_ADMIN",
    },
  });

  console.log("관리자 계정이 생성되었습니다.");
  console.log("  이메일:", adminEmail);
  console.log("  비밀번호:", adminPassword);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
