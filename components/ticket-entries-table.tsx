"use client";

import React from "react";
import { Button } from "@/components/ui/button";

export interface TicketRow {
  ticketNumber: number;
  phone: string;
  purchaseId: string;
  lotteryName: string;
  txnDate: string; // ISO string
}

interface Props {
  rows: TicketRow[];
  totalTickets: number;
  showExport?: boolean;
  exportFilename?: string;
}

const PAGE_SIZE = 50;

function phoneHash(phone: string): number {
  let hash = 0;
  for (let i = 0; i < phone.length; i++) {
    hash = ((hash << 5) - hash) + phone.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function colorForPhone(phone: string) {
  const hue = phoneHash(phone) % 360;
  return {
    bg: `hsl(${hue}, 10%, 12%)`,
    accent: `hsl(${hue}, 18%, 52%)`,
    text: `hsl(${hue}, 12%, 68%)`,
  };
}

// Pastel version for Excel cell backgrounds (FFRRGGBB)
function excelArgbForPhone(phone: string): string {
  const hue = phoneHash(phone) % 360;
  const s = 45 / 100;
  const l = 82 / 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + hue / 30) % 12;
    const c = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * c).toString(16).padStart(2, "0").toUpperCase();
  };
  return `FF${f(0)}${f(8)}${f(4)}`;
}

function formatDate(iso: string) {
  const d = new Date(new Date(iso).toLocaleString("en-US", { timeZone: "Asia/Ulaanbaatar" }));
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}/${mm}/${dd} ${hh}:${min}`;
}

export default function TicketEntriesTable({ rows, totalTickets, showExport, exportFilename }: Props) {
  const [page, setPage] = React.useState(1);
  const [exporting, setExporting] = React.useState(false);
  const [phoneFilter, setPhoneFilter] = React.useState("");

  const padWidth = String(totalTickets).length;
  const pad = (n: number) => String(n).padStart(padWidth, "0");

  const filtered = phoneFilter
    ? rows.filter((r) => r.phone.includes(phoneFilter))
    : rows;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function handleExport() {
    setExporting(true);
    try {
      const ExcelJS = (await import("exceljs")).default;
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet("Тасалбарууд");

      ws.columns = [
        { header: "#", key: "num", width: 8 },
        { header: "Огноо", key: "date", width: 22 },
        { header: "Сугалааны нэр", key: "name", width: 32 },
        { header: "Утасны дугаар", key: "phone", width: 18 },
      ];

      // Style header row
      ws.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1A1A1A" } };
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      });

      for (const row of rows) {
        const argb = excelArgbForPhone(row.phone);
        const r = ws.addRow({
          num: pad(row.ticketNumber),
          date: formatDate(row.txnDate),
          name: row.lotteryName,
          phone: row.phone,
        });
        r.eachCell((cell) => {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb } };
        });
      }

      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = exportFilename ?? "tasalbar.xlsx";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 py-24 text-center">
        <p className="text-white/30">Одоогоор тасалбар аваагүй байна</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <input
          type="text"
          inputMode="numeric"
          placeholder="Утасны дугаараар шүүх..."
          value={phoneFilter}
          onChange={(e) => {
            setPhoneFilter(e.target.value);
            setPage(1);
          }}
          className="w-56 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-white/20"
        />
        {showExport && (
          <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
            {exporting ? "Экспорт хийж байна..." : "Excel татах"}
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.06]">
        {/* Header */}
        <div className="grid grid-cols-[56px_150px_1fr_140px] border-b border-white/[0.06] bg-white/[0.03] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white/30">
          <span>#</span>
          <span>Огноо</span>
          <span>Сугалааны нэр</span>
          <span>Утасны дугаар</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-white/[0.03]">
          {pageRows.map((row) => {
            const color = colorForPhone(row.phone);
            return (
              <div
                key={`${row.purchaseId}-${row.ticketNumber}`}
                className="grid grid-cols-[56px_150px_1fr_140px] items-center px-5 py-3 text-sm"
                style={{ backgroundColor: color.bg }}
              >
                <span className="font-mono font-bold tabular-nums" style={{ color: color.accent }}>
                  {pad(row.ticketNumber)}
                </span>
                <span className="text-xs" style={{ color: color.accent }}>
                  {formatDate(row.txnDate)}
                </span>
                <span className="truncate pr-4" style={{ color: color.text }}>
                  {row.lotteryName}
                </span>
                <span className="font-mono tracking-wide" style={{ color: color.text }}>
                  {row.phone}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-white/[0.06] bg-white/[0.02] px-5 py-3 flex items-center justify-between text-xs text-white/25">
          <span>
            {phoneFilter
              ? `${filtered.length} / ${rows.length} тасалбар`
              : `Нийт ${rows.length} тасалбар`}
          </span>
          {totalPages > 1 && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="disabled:opacity-30 hover:text-white/60 transition"
              >
                ← Өмнөх
              </button>
              <span className="text-white/40">{page} / {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="disabled:opacity-30 hover:text-white/60 transition"
              >
                Дараах →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
