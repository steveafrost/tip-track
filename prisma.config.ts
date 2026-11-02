import { existsSync } from "node:fs";
import { defineConfig, env } from "prisma/config";

// Prisma 5 loaded .env automatically; Prisma 7 does not.
if (existsSync(".env")) {
  process.loadEnvFile(".env");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Migrations need a direct (non-pooled) connection, matching the
    // `directUrl` the schema used before Prisma 7.
    url: env("POSTGRES_URL_NON_POOLING"),
  },
});
