import { pool } from "@/lib/db";
import PurchasesList from "./purchases-list";

export default async function PurchasesPage() {
  const result = await pool.query(`
    SELECT p.*, li.name AS lottery_name, li.code AS lottery_code
    FROM purchases p
    JOIN lottery_items li ON li.id = p.lottery_item_id
    ORDER BY p.txn_date DESC
    LIMIT 500
  `);

  return (
    <div className="flex flex-col gap-4 p-4 pt-0">
      <div>
        <h1 className="text-xl font-semibold">Худалдан авалт</h1>
        <p className="text-muted-foreground text-sm">
          Амжилттай бүртгэгдсэн тасалбарын худалдан авалтууд
        </p>
      </div>
      <PurchasesList purchases={result.rows} />
    </div>
  );
}
