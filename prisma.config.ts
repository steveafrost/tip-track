import { existsSync } from "node:fs";
import { defineConfig } from "prisma/config";

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
    // `directUrl` the schema used before Prisma 7. This is read during
    // `prisma generate`, which runs in postinstall where the database URL is
    // not set, so keep it optional: only commands that actually connect fail.
    url:
      process.env.POSTGRES_URL_NON_POOLING ??
      process.env.DATABASE_URL ??
      "",
  },
});
