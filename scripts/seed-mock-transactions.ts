import "dotenv/config";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seed() {
  // 1. Set code on existing Shelby Mustang lottery
  await pool.query(
    `UPDATE lottery_items SET code = 'SHBY' WHERE name = 'Shelby Mustang' AND code IS NULL`
  );

  // 2. Create a second lottery item for variety
  await pool.query(`
    INSERT INTO lottery_items (name, price, bank_account_number, total_tickets, sold_tickets, code)
    VALUES ('iPhone 16 Pro', 10000, NULL, 500, 0, 'IPHN')
    ON CONFLICT DO NOTHING
  `);

  const itemsResult = await pool.query(
    `SELECT id, name, code, price, total_tickets FROM lottery_items WHERE code IN ('SHBY', 'IPHN')`
  );
  const items: Record<string, any> = {};
  for (const row of itemsResult.rows) items[row.code] = row;

  const shby = items["SHBY"];
  const iphn = items["IPHN"];

  // Helper to insert a transaction + optional purchase
  async function insertTxn({
    jrNo, amount, desc, phone, code, status, lottery, ticketCount,
  }: {
    jrNo: string; amount: number; desc: string; phone: string | null;
    code: string | null; status: string; lottery: any; ticketCount: number;
  }) {
    let purchaseId: string | null = null;

    if (ticketCount > 0 && lottery && phone) {
      const pr = await pool.query(
        `INSERT INTO purchases
           (lottery_item_id, phone_number, amount, ticket_count, jr_no, jr_item_no, txn_date, txn_desc)
         VALUES ($1,$2,$3,$4,$5,'1',$6,$7)
         ON CONFLICT (jr_no, jr_item_no) DO NOTHING
         RETURNING id`,
        [lottery.id, phone, amount, ticketCount, jrNo, new Date().toISOString(), desc]
      );
      if (pr.rows.length > 0) {
        purchaseId = pr.rows[0].id;
        await pool.query(
          `UPDATE lottery_items SET sold_tickets = sold_tickets + $1 WHERE id = $2`,
          [ticketCount, lottery.id]
        );
      }
    }

    const txnResult = await pool.query(
      `INSERT INTO bank_transactions
         (jr_no, jr_item_no, amount, txn_date, txn_desc, cont_acnt_no, cont_acnt_name,
          parsed_code, parsed_phone, parse_confidence, status, purchase_id)
       VALUES ($1,'1',$2,$3,$4,'MN123456789','Test Customer',$5,$6,$7,$8,$9)
       ON CONFLICT (jr_no, jr_item_no) DO NOTHING
       RETURNING id`,
      [jrNo, amount, new Date(Date.now() - Math.random() * 7 * 86400000).toISOString(),
       desc, code, phone, code ? "high" : phone ? "none" : "none", status, purchaseId]
    );

    if (txnResult.rows.length > 0 && purchaseId) {
      await pool.query(
        `UPDATE purchases SET bank_transaction_id = $1 WHERE id = $2`,
        [txnResult.rows[0].id, purchaseId]
      );
    }
  }

  // completed — perfect match
  await insertTxn({ jrNo: "MOCK001", amount: 50000, desc: "SHBY-99001122",
    phone: "99001122", code: "SHBY", status: "completed", lottery: shby, ticketCount: 1 });
  await insertTxn({ jrNo: "MOCK002", amount: 200000, desc: "SHBY-88223344",
    phone: "88223344", code: "SHBY", status: "completed", lottery: shby, ticketCount: 4 });
  await insertTxn({ jrNo: "MOCK003", amount: 30000, desc: "IPHN-77334455",
    phone: "77334455", code: "IPHN", status: "completed", lottery: iphn, ticketCount: 3 });
  await insertTxn({ jrNo: "MOCK004", amount: 50000, desc: "IPHN-91234567",
    phone: "91234567", code: "IPHN", status: "completed", lottery: iphn, ticketCount: 5 });

  // warning — amount has remainder
  await insertTxn({ jrNo: "MOCK005", amount: 75000, desc: "SHBY-99887766",
    phone: "99887766", code: "SHBY", status: "warning", lottery: shby, ticketCount: 1 });
  await insertTxn({ jrNo: "MOCK006", amount: 35000, desc: "IPHN-80055818",
    phone: "80055818", code: "IPHN", status: "warning", lottery: iphn, ticketCount: 3 });

  // oversold — capped at remaining
  await insertTxn({ jrNo: "MOCK007", amount: 500000, desc: "SHBY-99556677",
    phone: "99556677", code: "SHBY", status: "oversold", lottery: shby, ticketCount: 2 });

  // insufficient — amount too low
  await insertTxn({ jrNo: "MOCK008", amount: 5000, desc: "IPHN-88991100",
    phone: "88991100", code: "IPHN", status: "insufficient", lottery: null, ticketCount: 0 });

  // unmatched — phone found, no code match
  await insertTxn({ jrNo: "MOCK009", amount: 50000, desc: "UNKN-99112233",
    phone: "99112233", code: null, status: "unmatched", lottery: null, ticketCount: 0 });
  await insertTxn({ jrNo: "MOCK010", amount: 20000, desc: "XXXX-77889900",
    phone: "77889900", code: null, status: "unmatched", lottery: null, ticketCount: 0 });

  // error — no phone extractable
  await insertTxn({ jrNo: "MOCK011", amount: 50000, desc: "Shelby mustang sugalaa",
    phone: null, code: null, status: "error", lottery: null, ticketCount: 0 });
  await insertTxn({ jrNo: "MOCK012", amount: 10000, desc: "Utsan zasgiin gazar",
    phone: null, code: null, status: "error", lottery: null, ticketCount: 0 });

  console.log("Mock transactions seeded");
  await pool.end();
}

seed().catch((err) => { console.error(err); process.exit(1); });
