import "dotenv/config";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  // Clear all transactional data
  await pool.query(`DELETE FROM bank_transactions`);
  await pool.query(`DELETE FROM purchases`);

  // Reset sold_tickets on all lottery items
  await pool.query(`UPDATE lottery_items SET sold_tickets = 0`);

  console.log("Cleared bank_transactions, purchases. Reset sold_tickets to 0.");

  // Fetch a lottery item to use as parsed_code
  const items = await pool.query(`SELECT id, code, price FROM lottery_items LIMIT 3`);
  console.log("Lottery items:", items.rows);

  // 5 fake bank transactions with phone numbers starting with 7 or lower (outside prefix dict)
  const fakeTxns = [
    { jr_no: "TXN001", jr_item_no: "1", amount: 10000, phone: "77112233", desc: "77112233 LOTUS001" },
    { jr_no: "TXN002", jr_item_no: "1", amount: 20000, phone: "71234567", desc: "71234567 payment" },
    { jr_no: "TXN003", jr_item_no: "1", amount: 10000, phone: "65998877", desc: "65998877 LOTUS001" },
    { jr_no: "TXN004", jr_item_no: "1", amount: 30000, phone: "75551122", desc: "75551122 transfer" },
    { jr_no: "TXN005", jr_item_no: "1", amount: 10000, phone: "72339900", desc: "72339900 LOTUS001" },
  ];

  for (const t of fakeTxns) {
    await pool.query(
      `INSERT INTO bank_transactions
         (jr_no, jr_item_no, amount, txn_date, txn_desc, cont_acnt_no, cont_acnt_name,
          parsed_phone, parse_confidence, status)
       VALUES ($1, $2, $3, NOW(), $4, '1234567890', 'Test User',
               $5, 'phone', 'unmatched')`,
      [t.jr_no, t.jr_item_no, t.amount, t.desc, t.phone]
    );
    console.log(`Inserted fake txn ${t.jr_no} phone=${t.phone} amount=${t.amount}`);
  }

  console.log("Done.");
  await pool.end();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
