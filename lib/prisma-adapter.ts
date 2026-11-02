import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Prisma 5's engine always negotiated TLS with the database; node-postgres
 * does not, and the Vercel/Neon connection strings carry no sslmode, so the
 * adapter has to be told explicitly or the first query fails with P2010.
 *
 * An explicit sslmode in the URL wins; otherwise use TLS for everything that
 * is not a local database.
 */
export function createPrismaAdapter() {
  const connectionString = process.env.POSTGRES_PRISMA_URL;
  const hasSslMode = /[?&]sslmode=/i.test(connectionString ?? "");
  const isLocal = /@(localhost|127\.0\.0\.1)[:/]/i.test(connectionString ?? "");

  return new PrismaPg({
    connectionString,
    ...(hasSslMode || isLocal ? {} : { ssl: true }),
  });
}
