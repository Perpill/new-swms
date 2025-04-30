// drizzle.config.js
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/utils/db/schema.ts",
  out: "./drizzle/migrations",
  dbCredentials: {
    url: "postgresql://neondb_owner:npg_Wy5Ur3IDiogq@ep-noisy-firefly-a4g3d15k-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require",
  },
});
