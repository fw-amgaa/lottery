import "dotenv/config";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const bt = await pool.query(`
    SELECT jr_no, jr_item_no, amount, txn_desc, parsed_phone, parse_confidence, status, purchase_id, created_at
    FROM bank_transactions
    ORDER BY created_at DESC
    LIMIT 30
  `);
  console.log("\n=== bank_transactions ===");
  console.table(bt.rows.map(r => ({
    jr_no: r.jr_no,
    amount: r.amount,
    txn_desc: r.txn_desc,
    phone: r.parsed_phone,
    confidence: r.parse_confidence,
    status: r.status,
    has_purchase: !!r.purchase_id,
  })));

  const pu = await pool.query(`
    SELECT p.phone_number, p.ticket_count, p.amount, p.txn_date, li.name as lottery
    FROM purchases p
    JOIN lottery_items li ON li.id = p.lottery_item_id
    ORDER BY p.txn_date DESC
    LIMIT 20
  `);
  console.log("\n=== purchases ===");
  console.table(pu.rows);

  await pool.end();
}

run().catch(console.error);
