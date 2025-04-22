// drizzle.config.js
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/utils/db/schema.ts",
  out: "./drizzle/migrations",
  dbCredentials: {
    url: "postgresql://neondb_owner:npg_w1QmkEiaANb8@ep-fancy-mouse-a5tcmu8x-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require",
  },
});
