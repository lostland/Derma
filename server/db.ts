import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle, type NeonDatabase } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

let pool: Pool | undefined;
let database: NeonDatabase<typeof schema> | undefined;

export function getDatabaseClient(): NeonDatabase<typeof schema> | undefined {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return undefined;
  }

  if (!pool) {
    pool = new Pool({ connectionString });
    database = drizzle({ client: pool, schema });
  }

  return database;
}
