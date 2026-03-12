import { pool } from "@/lib/db";

export default async function PurchasesPage() {
  const result = await pool.query(`
    SELECT p.*, li.name AS lottery_name, li.code AS lottery_code
    FROM purchases p
    JOIN lottery_items li ON li.id = p.lottery_item_id
    ORDER BY p.txn_date DESC
    LIMIT 500
  `);
  const purchases = result.rows;

  return (
    <div className="flex flex-col gap-4 p-4 pt-0">
      <div>
        <h1 className="text-xl font-semibold">Purchases</h1>
        <p className="text-muted-foreground text-sm">All successful ticket purchases</p>
      </div>
      <div className="rounded-lg border overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-2 font-medium">Date</th>
              <th className="text-left px-4 py-2 font-medium">Lottery</th>
              <th className="text-left px-4 py-2 font-medium">Code</th>
              <th className="text-left px-4 py-2 font-medium">Phone</th>
              <th className="text-left px-4 py-2 font-medium">Amount</th>
              <th className="text-left px-4 py-2 font-medium">Tickets</th>
            </tr>
          </thead>
          <tbody>
            {purchases.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-muted-foreground">No purchases yet</td>
              </tr>
            )}
            {purchases.map((p: any) => (
              <tr key={p.id} className="border-t hover:bg-muted/30">
                <td className="px-4 py-2 whitespace-nowrap text-muted-foreground">
                  {new Date(p.txn_date).toLocaleString("mn-MN")}
                </td>
                <td className="px-4 py-2">{p.lottery_name}</td>
                <td className="px-4 py-2 font-mono">{p.lottery_code}</td>
                <td className="px-4 py-2">{p.phone_number}</td>
                <td className="px-4 py-2 font-medium">{Number(p.amount).toLocaleString()}₮</td>
                <td className="px-4 py-2 font-semibold">{p.ticket_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
