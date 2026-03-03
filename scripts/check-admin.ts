import { prisma } from "../src/lib/prisma";

async function main() {
  const admin = await prisma.user.findFirst({
    where: { role: "SUPER_ADMIN" },
    select: { id: true, email: true, name: true, role: true },
  });
  if (admin) {
    console.log("관리자 계정 존재:", admin);
  } else {
    console.log("관리자 계정 없음. npm run db:seed 실행 필요.");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
