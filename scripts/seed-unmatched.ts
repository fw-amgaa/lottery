import "dotenv/config";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const UNMATCHED = [
  { jrNo: "UNM001", amount: 50000,  desc: "SHBY-80055818",  phone: "80055818" },
  { jrNo: "UNM002", amount: 20000,  desc: "IPHN-99334455",  phone: "99334455" },
  { jrNo: "UNM003", amount: 30000,  desc: "SHBY-88112233",  phone: "88112233" },
  { jrNo: "UNM004", amount: 10000,  desc: "IPHN-77223344",  phone: "77223344" },
  { jrNo: "UNM005", amount: 60000,  desc: "SHBY-91122334",  phone: "91122334" },
  { jrNo: "UNM006", amount: 40000,  desc: "IPHN-80998877",  phone: "80998877" },
  { jrNo: "UNM007", amount: 25000,  desc: "SHBY-99001122",  phone: "99001122" },
  { jrNo: "UNM008", amount: 50000,  desc: "IPHN-88776655",  phone: "88776655" },
  { jrNo: "UNM009", amount: 70000,  desc: "SHBY-77556644",  phone: "77556644" },
  { jrNo: "UNM010", amount: 10000,  desc: "IPHN-91234500",  phone: "91234500" },
  { jrNo: "UNM011", amount: 30000,  desc: "SHBY-80001234",  phone: "80001234" },
  { jrNo: "UNM012", amount: 20000,  desc: "IPHN-99887700",  phone: "99887700" },
  { jrNo: "UNM013", amount: 50000,  desc: "SHBY-77001199",  phone: "77001199" },
  { jrNo: "UNM014", amount: 40000,  desc: "IPHN-88990011",  phone: "88990011" },
  { jrNo: "UNM015", amount: 100000, desc: "SHBY-91009988",  phone: "91009988" },
];

async function seed() {
  let inserted = 0;
  for (const t of UNMATCHED) {
    const txnDate = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString();
    const res = await pool.query(
      `INSERT INTO bank_transactions
         (jr_no, jr_item_no, txn_date, amount, txn_desc, parsed_phone, status)
       VALUES ($1, '1', $2, $3, $4, $5, 'unmatched')
       ON CONFLICT (jr_no, jr_item_no) DO NOTHING
       RETURNING id`,
      [t.jrNo, txnDate, t.amount, t.desc, t.phone]
    );
    if (res.rows.length > 0) inserted++;
  }
  console.log(`Inserted ${inserted} unmatched transactions (${UNMATCHED.length - inserted} already existed)`);
  await pool.end();
}

seed().catch((err) => { console.error(err); process.exit(1); });
