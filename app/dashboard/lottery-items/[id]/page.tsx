import { pool } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import TicketEntriesTable from "@/components/ticket-entries-table";
import type { TicketRow } from "@/components/ticket-entries-table";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const itemResult = await pool.query(
    "SELECT id, name, image_url, total_tickets, sold_tickets, facebook_url, code, archived FROM lottery_items WHERE id = $1",
    [id]
  );
  if (itemResult.rows.length === 0) notFound();
  const item = itemResult.rows[0];

  const purchasesResult = await pool.query(
    `SELECT id, phone_number, ticket_count, txn_date
     FROM purchases
     WHERE lottery_item_id = $1
     ORDER BY txn_date ASC, id ASC`,
    [id]
  );

  const rows: TicketRow[] = [];
  let counter = 1;
  for (const p of purchasesResult.rows) {
    for (let i = 0; i < p.ticket_count; i++) {
      rows.push({
        ticketNumber: counter++,
        phone: p.phone_number,
        purchaseId: p.id,
        lotteryName: item.name,
        txnDate: new Date(p.txn_date).toISOString(),
      });
    }
  }

  const filename = `${item.name.replace(/\s+/g, "_")}_tasalbar.xlsx`;

  return (
    <div className="flex flex-col gap-6 p-4 pt-0">
      {/* Item header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {item.image_url && (
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-white/10">
              <Image src={item.image_url} alt={item.name} fill className="object-cover" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-semibold">{item.name}</h1>
              {item.archived && (
                <span className="rounded-full border border-muted-foreground/30 px-2 py-0.5 text-xs text-muted-foreground">
                  Дууссан
                </span>
              )}
              {item.code && (
                <span className="rounded-full border border-border px-2 py-0.5 font-mono text-xs text-muted-foreground">
                  {item.code}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {item.sold_tickets} / {item.total_tickets} тасалбар зарагдсан
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/lottery-items"
          className="text-sm text-muted-foreground hover:text-foreground transition"
        >
          ← Сугалаанууд руу буцах
        </Link>
      </div>

      <TicketEntriesTable rows={rows} totalTickets={item.total_tickets} showExport exportFilename={filename} />
    </div>
  );
}
