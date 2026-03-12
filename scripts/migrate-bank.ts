import "dotenv/config";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  // Make bank_account_number nullable (no longer required)
  await pool.query(`
    ALTER TABLE lottery_items ALTER COLUMN bank_account_number DROP NOT NULL;
  `);

  // Add code column if not exists
  await pool.query(`
    ALTER TABLE lottery_items ADD COLUMN IF NOT EXISTS code TEXT UNIQUE;
  `);

  // Add bank_transaction_id to purchases
  await pool.query(`
    ALTER TABLE purchases ADD COLUMN IF NOT EXISTS bank_transaction_id UUID;
  `);

  // bank_transactions: stores every raw incoming transaction
  await pool.query(`
    CREATE TABLE IF NOT EXISTS bank_transactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      jr_no TEXT NOT NULL,
      jr_item_no TEXT NOT NULL,
      amount INTEGER NOT NULL,
      txn_date TIMESTAMPTZ NOT NULL,
      txn_desc TEXT NOT NULL,
      cont_acnt_no TEXT,
      cont_acnt_name TEXT,
      parsed_code TEXT,
      parsed_phone TEXT,
      parse_confidence TEXT NOT NULL DEFAULT 'none',
      status TEXT NOT NULL DEFAULT 'pending',
      purchase_id UUID REFERENCES purchases(id),
      resolved_at TIMESTAMPTZ,
      resolution_note TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (jr_no, jr_item_no)
    );
  `);

  console.log("Migration complete");
  await pool.end();
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
