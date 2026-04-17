import "dotenv/config";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_state (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  console.log("✓ app_state table created");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS cron_logs (
      id BIGSERIAL PRIMARY KEY,
      started_at TIMESTAMPTZ NOT NULL,
      finished_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      duration_ms INTEGER NOT NULL,
      query_start_date TEXT,
      query_end_date TEXT,
      bank_total INTEGER,
      bank_credits INTEGER,
      processed INTEGER,
      flagged INTEGER,
      status TEXT NOT NULL,
      error TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_cron_logs_started_at ON cron_logs (started_at DESC);
    CREATE INDEX IF NOT EXISTS idx_cron_logs_status ON cron_logs (status);
  `);
  console.log("✓ cron_logs table created");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS sms_logs (
      id BIGSERIAL PRIMARY KEY,
      phone TEXT NOT NULL,
      operator TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL,
      carrier_status INTEGER,
      carrier_response TEXT,
      error TEXT,
      duration_ms INTEGER NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_sms_logs_created_at ON sms_logs (created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_sms_logs_phone ON sms_logs (phone);
  `);
  console.log("✓ sms_logs table created");

  await pool.end();
  console.log("Migration complete.");
}

run().catch((e) => {
  console.error("Migration failed:", e);
  process.exit(1);
});
