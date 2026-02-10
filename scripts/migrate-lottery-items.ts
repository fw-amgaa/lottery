import "dotenv/config";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS lottery_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      price INTEGER NOT NULL,
      bank_account_number TEXT NOT NULL,
      total_tickets INTEGER NOT NULL,
      sold_tickets INTEGER NOT NULL DEFAULT 0,
      google_sheet_url TEXT,
      facebook_url TEXT,
      image_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  console.log("lottery_items table created successfully");
  await pool.end();
}

migrate();
