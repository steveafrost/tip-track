import { PrismaClient } from "@prisma/client";
import { createPrismaAdapter } from "./prisma-adapter";

function createPrismaClient() {
  return new PrismaClient({ adapter: createPrismaAdapter() });
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = createPrismaClient();
} else {
  let globalWithPrisma = global as typeof globalThis & {
    prisma: PrismaClient;
  };
  if (!globalWithPrisma.prisma) {
    globalWithPrisma.prisma = createPrismaClient();
  }
  prisma = globalWithPrisma.prisma;
}

export default prisma;
