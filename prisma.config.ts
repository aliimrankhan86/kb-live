import { config } from "dotenv";
config({ path: ".env.local" });
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // DIRECT_URL (port 5432) used for all CLI operations (db push, migrate, db pull).
    // pgBouncer pooler (port 6543) blocks advisory locks and prepared statements in the
    // schema engine — CLI must bypass it. Runtime PrismaClient reads DATABASE_URL from env.
    url: process.env["DIRECT_URL"],
  } as { url?: string },
});
