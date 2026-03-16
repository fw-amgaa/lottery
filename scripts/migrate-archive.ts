import "dotenv/config";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  await pool.query(
    "ALTER TABLE lottery_items ADD COLUMN IF NOT EXISTS archived BOOLEAN NOT NULL DEFAULT FALSE"
  );
  console.log("Migration complete: added archived column");
  await pool.end();
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
