import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

const ADMIN_EMAIL = "admin@staynest.local";
const NEW_PASSWORD = "Admin123!";

async function main() {
  const admin = await prisma.user.findFirst({
    where: { role: "SUPER_ADMIN" },
  });

  if (!admin) {
    console.log("관리자 계정이 없습니다. npm run db:seed를 먼저 실행하세요.");
    return;
  }

  const hashed = await bcrypt.hash(NEW_PASSWORD, 12);
  await prisma.user.update({
    where: { id: admin.id },
    data: { password: hashed },
  });

  console.log("관리자 비밀번호가 재설정되었습니다.");
  console.log("  이메일:", ADMIN_EMAIL);
  console.log("  비밀번호:", NEW_PASSWORD);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
