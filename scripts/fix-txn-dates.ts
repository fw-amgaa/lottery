import "dotenv/config";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const sysDates: { jr_no: string; jr_item_no: string; sys_date: string }[] = [
  { jr_no: "957290802971", jr_item_no: "4", sys_date: "2026-03-17T15:53:14" },
  { jr_no: "957290921419", jr_item_no: "4", sys_date: "2026-03-17T16:18:05" },
  { jr_no: "957290941181", jr_item_no: "4", sys_date: "2026-03-17T16:32:23" },
  { jr_no: "957290948410", jr_item_no: "4", sys_date: "2026-03-17T16:59:10" },
];

async function run() {
  for (const t of sysDates) {
    const bt = await pool.query(
      `UPDATE bank_transactions SET txn_date = $1 WHERE jr_no = $2 AND jr_item_no = $3 RETURNING id`,
      [t.sys_date, t.jr_no, t.jr_item_no]
    );
    if (bt.rows.length === 0) {
      console.log(`No bank_transaction found for ${t.jr_no}/${t.jr_item_no}`);
      continue;
    }
    const btId = bt.rows[0].id;
    const pu = await pool.query(
      `UPDATE purchases SET txn_date = $1 WHERE bank_transaction_id = $2 RETURNING id`,
      [t.sys_date, btId]
    );
    console.log(`${t.jr_no}: bank_transaction updated, ${pu.rowCount} purchase(s) updated → ${t.sys_date}`);
  }
  await pool.end();
}

run().catch((err) => { console.error(err); process.exit(1); });
