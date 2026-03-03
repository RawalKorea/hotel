import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const version = process.env.VERSION || "1.1.0";
  const title = process.argv[2] || "업데이트";
  const content = process.argv[3] || "다양한 개선 사항이 적용되었습니다.";

  await prisma.patchNote.create({
    data: { version, title, content },
  });
  console.log("Patch note added:", version, title);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
