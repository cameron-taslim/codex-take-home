import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

async function main() {
  const email = process.env.AUTH_DEMO_EMAIL ?? "demo@example.com";
  const password = process.env.AUTH_DEMO_PASSWORD ?? "password123";
  const passwordHash = await hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: {
      displayName: "Demo User",
      passwordHash,
    },
    create: {
      email,
      displayName: "Demo User",
      passwordHash,
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
