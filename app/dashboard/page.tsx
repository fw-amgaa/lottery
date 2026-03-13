import { pool } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { BankTransactionWithLottery } from "@/lib/bank-transactions";

type RecentPurchase = {
  id: string;
  txn_date: Date;
  lottery_name: string;
  phone_number: string;
  amount: number;
  ticket_count: number;
};

export default async function DashboardPage() {
  const today = new Date().toISOString().split("T")[0];

  const [statsResult, flaggedResult, recentResult] = await Promise.all([
    pool.query(
      `
      SELECT
        COUNT(*) FILTER (WHERE status = 'completed' OR status = 'warning') AS total_purchases,
        COALESCE(SUM(amount) FILTER (WHERE status = 'completed' OR status = 'warning'), 0) AS total_revenue,
        COUNT(*) FILTER (WHERE status IN ('warning','unmatched','error') AND resolved_at IS NULL) AS flagged_count,
        COUNT(*) FILTER (WHERE DATE(txn_date) = $1 AND (status = 'completed' OR status = 'warning')) AS today_purchases,
        COALESCE(SUM(amount) FILTER (WHERE DATE(txn_date) = $1 AND (status = 'completed' OR status = 'warning')), 0) AS today_revenue
      FROM bank_transactions
    `,
      [today],
    ),
    pool.query(`
      SELECT bt.*, li.name AS lottery_name, p.ticket_count
      FROM bank_transactions bt
      LEFT JOIN purchases p ON p.id = bt.purchase_id
      LEFT JOIN lottery_items li ON li.id = p.lottery_item_id
      WHERE bt.status IN ('warning','unmatched','error') AND bt.resolved_at IS NULL
      ORDER BY bt.txn_date DESC
      LIMIT 10
    `),
    pool.query(`
      SELECT p.*, li.name AS lottery_name
      FROM purchases p
      JOIN lottery_items li ON li.id = p.lottery_item_id
      ORDER BY p.txn_date DESC
      LIMIT 5
    `),
  ]);

  const stats = statsResult.rows[0];
  const flagged = flaggedResult.rows;
  const recent = recentResult.rows;

  const STATUS_BADGE: Record<string, string> = {
    warning: "bg-yellow-100 text-yellow-800",
    unmatched: "bg-orange-100 text-orange-800",
    error: "bg-red-100 text-red-800",
  };

  return (
    <div className="flex flex-col gap-6 p-4 pt-0">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Өнөөдрийн орлого
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {Number(stats.today_revenue).toLocaleString()}₮
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Өнөөдрийн авалт
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.today_purchases}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Нийт орлого
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {Number(stats.total_revenue).toLocaleString()}₮
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Шалгах шаардлагатай
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">
              {stats.flagged_count}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Flagged transactions */}
      {flagged.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">
              Шалгах шаардлагатай ({flagged.length})
            </h2>
            <Link href="/dashboard/transactions">
              <Button variant="outline" size="sm">
                Бүх гүйлгээ
              </Button>
            </Link>
          </div>
          <div className="rounded-lg border overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">Огноо</th>
                  <th className="text-left px-4 py-2 font-medium">Дүн</th>
                  <th className="text-left px-4 py-2 font-medium">Тайлбар</th>
                  <th className="text-left px-4 py-2 font-medium">Төлөв</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {flagged.map((txn: BankTransactionWithLottery) => (
                  <tr key={txn.id} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-2 whitespace-nowrap text-muted-foreground">
                      {new Date(txn.txn_date).toLocaleString("mn-MN", {
                        timeZone: "Asia/Ulaanbaatar",
                        hour12: false,
                      })}
                    </td>
                    <td className="px-4 py-2 font-medium">
                      {Number(txn.amount).toLocaleString()}₮
                    </td>
                    <td
                      className="px-4 py-2 max-w-[200px] truncate text-muted-foreground"
                      title={txn.txn_desc}
                    >
                      {txn.txn_desc}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[txn.status] ?? ""}`}
                      >
                        {txn.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <Link href="/dashboard/transactions">
                        <Button size="sm" variant="outline">
                          Шийдвэрлэх
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent purchases */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Сүүлийн худалдан авалтууд</h2>
          <Link href="/dashboard/purchases">
            <Button variant="outline" size="sm">
              Бүгдийг харах
            </Button>
          </Link>
        </div>
        <div className="rounded-lg border overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Огноо</th>
                <th className="text-left px-4 py-2 font-medium">Сугалаа</th>
                <th className="text-left px-4 py-2 font-medium">Утас</th>
                <th className="text-left px-4 py-2 font-medium">Дүн</th>
                <th className="text-left px-4 py-2 font-medium">Тасалбар</th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-6 text-muted-foreground"
                  >
                    Худалдан авалт байхгүй
                  </td>
                </tr>
              )}
              {recent.map((p: RecentPurchase) => (
                <tr key={p.id} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-2 whitespace-nowrap text-muted-foreground">
                    {new Date(p.txn_date).toLocaleString("mn-MN", {
                      timeZone: "Asia/Ulaanbaatar",
                      hour12: false,
                    })}
                  </td>
                  <td className="px-4 py-2">{p.lottery_name}</td>
                  <td className="px-4 py-2">{p.phone_number}</td>
                  <td className="px-4 py-2 font-medium">
                    {Number(p.amount).toLocaleString()}₮
                  </td>
                  <td className="px-4 py-2 font-semibold">{p.ticket_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
