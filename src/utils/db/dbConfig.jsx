import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
const sql = neon(
  // process.env.DATABASE_URL
  // "postgresql://zerotohero_owner:SPVe2rokvBf6@ep-bitter-shadow-a5lbwa60.us-east-2.aws.neon.tech/zerotohero?sslmode=require"
  "postgresql://neondb_owner:npg_Wy5Ur3IDiogq@ep-noisy-firefly-a4g3d15k-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"
);
export const db = drizzle(sql, { schema });
