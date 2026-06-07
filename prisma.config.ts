import { config } from "dotenv";
config({ path: ".env.local" });
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
    // directUrl routes DDL (migrate/db push) through the direct connection,
    // bypassing pgBouncer which doesn't support advisory locks.
    // Type stubs for Prisma 7.8 are behind the runtime — cast to suppress.
    ...(process.env["DIRECT_URL"] ? { directUrl: process.env["DIRECT_URL"] } : {}),
  } as { url?: string },
});
