import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../app/generated/prisma/client";

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set.");
  }

  const adapter = new PrismaPg({
    connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  });
  const prisma = new PrismaClient({ adapter });

  try {
    await prisma.appSettings.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        blogEnabled: true,
        projectsEnabled: true,
        shopEnabled: true,
      },
    });

    await prisma.analyticsSettings.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        enabled: false,
      },
    });

    console.log("Seeded default app settings.");
  } finally {
    await prisma.$disconnect();
  }
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
