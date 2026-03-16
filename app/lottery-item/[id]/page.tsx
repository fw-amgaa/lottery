import { pool } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const FACEBOOK_FALLBACK = "https://www.facebook.com/profile.php?id=61574923694972";

interface Purchase {
  id: string;
  phone_number: string;
  ticket_count: number;
  txn_date: Date;
}

interface TicketRow {
  ticketNumber: number;
  phone: string;
  purchaseId: string;
  lotteryName: string;
  txnDate: Date;
}

// Very low saturation — nearly grey, just enough hue to group by color
function colorForPhone(phone: string) {
  let hash = 0;
  for (let i = 0; i < phone.length; i++) {
    hash = ((hash << 5) - hash) + phone.charCodeAt(i);
    hash |= 0;
  }
  const hue = Math.abs(hash) % 360;
  return {
    bg: `hsl(${hue}, 10%, 12%)`,
    accent: `hsl(${hue}, 18%, 52%)`,
    text: `hsl(${hue}, 12%, 68%)`,
  };
}

function formatDate(date: Date) {
  return new Date(date).toLocaleString("mn-MN", {
    timeZone: "Asia/Ulaanbaatar",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const itemResult = await pool.query(
    "SELECT id, name, image_url, total_tickets, sold_tickets, facebook_url, code FROM lottery_items WHERE id = $1",
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
  const purchases: Purchase[] = purchasesResult.rows;

  // Expand purchases into individual ticket rows
  const rows: TicketRow[] = [];
  let counter = 1;
  for (const p of purchases) {
    for (let i = 0; i < p.ticket_count; i++) {
      rows.push({
        ticketNumber: counter++,
        phone: p.phone_number,
        purchaseId: p.id,
        lotteryName: item.name,
        txnDate: p.txn_date,
      });
    }
  }

  const facebookUrl = item.facebook_url || FACEBOOK_FALLBACK;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="Азтай Монгол" width={30} height={30} />
            <span className="text-sm font-semibold tracking-tight text-white/70">
              Азтай Монгол
            </span>
          </Link>
          <a
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-white/60 transition hover:border-white/20 hover:text-white/90"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
              <path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396v8.01Z" />
            </svg>
            Facebook
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        {/* Lottery info */}
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center">
          {item.image_url && (
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-white/10">
              <Image src={item.image_url} alt={item.name} fill className="object-cover" />
            </div>
          )}
          <div className="flex-1">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
              Тасалбарын жагсаалт
            </p>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{item.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-white/40">
              {item.code && (
                <span className="font-mono text-white/60">{item.code}</span>
              )}
              <span>
                Нийт зарагдсан:{" "}
                <span className="font-semibold text-white/70">{item.sold_tickets}</span>
                {" / "}
                {item.total_tickets} тасалбар
              </span>
            </div>
          </div>
        </div>

        {/* Table */}
        {rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 py-24 text-center">
            <p className="text-white/30">Одоогоор тасалбар аваагүй байна</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/[0.06]">
            {/* Table header */}
            <div className="grid grid-cols-[56px_150px_1fr_140px] border-b border-white/[0.06] bg-white/[0.03] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white/30">
              <span>#</span>
              <span>Огноо</span>
              <span>Сугалааны нэр</span>
              <span>Утасны дугаар</span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-white/[0.03]">
              {rows.map((row) => {
                const color = colorForPhone(row.phone);
                return (
                  <div
                    key={`${row.purchaseId}-${row.ticketNumber}`}
                    className="grid grid-cols-[56px_150px_1fr_140px] items-center px-5 py-3 text-sm"
                    style={{ backgroundColor: color.bg }}
                  >
                    <span
                      className="font-mono font-bold tabular-nums"
                      style={{ color: color.accent }}
                    >
                      {row.ticketNumber}
                    </span>
                    <span className="text-xs" style={{ color: color.accent }}>
                      {formatDate(row.txnDate)}
                    </span>
                    <span className="truncate pr-4" style={{ color: color.text }}>
                      {row.lotteryName}
                    </span>
                    <span
                      className="font-mono tracking-wide"
                      style={{ color: color.text }}
                    >
                      {row.phone}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Footer summary */}
            <div className="border-t border-white/[0.06] bg-white/[0.02] px-5 py-3 text-xs text-white/25">
              Нийт {rows.length} тасалбар бүртгэгдсэн
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
