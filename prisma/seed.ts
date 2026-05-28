import { PrismaClient, Role, AccountStatus } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash("Admin@123456", 12);

  await prisma.user.upsert({
    where: { username: "admin" },
    update: {
      passwordHash,
      role: Role.ADMIN,
      status: AccountStatus.APPROVED,
    },
    create: {
      username: "admin",
      passwordHash,
      role: Role.ADMIN,
      status: AccountStatus.APPROVED,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
