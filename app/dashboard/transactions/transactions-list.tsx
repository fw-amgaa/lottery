"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { BankTransactionWithLottery } from "@/lib/bank-transactions";
import type { LotteryItem } from "@/lib/lottery-items";
import ResolveDialog from "./resolve-dialog";

const STATUS_BADGE: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  completed: { label: "Амжилттай", variant: "default" },
  warning: { label: "Анхааруулга", variant: "secondary" },
  oversold: { label: "Сугалааны тоо хэтэрсэн", variant: "secondary" },
  unmatched: { label: "Амжилтгүй", variant: "outline" },
  insufficient: { label: "Дүн хүрэлцэхгүй", variant: "outline" },
  error: { label: "Алдаа", variant: "destructive" },
};

const PAGE_SIZE = 20;

function formatDate(date: Date | string) {
  const d = new Date(new Date(date).toLocaleString("en-US", { timeZone: "Asia/Ulaanbaatar" }));
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}/${mm}/${dd} ${hh}:${min}`;
}

interface Props {
  transactions: BankTransactionWithLottery[];
  lotteries: LotteryItem[];
}

export default function TransactionsList({ transactions, lotteries }: Props) {
  const [resolving, setResolving] =
    React.useState<BankTransactionWithLottery | null>(null);
  const [filter, setFilter] = React.useState<string>("all");
  const [page, setPage] = React.useState(1);

  const filtered =
    filter === "all"
      ? transactions
      : transactions.filter((t) => t.status === filter);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleFilter(s: string) {
    setFilter(s);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 flex-wrap">
        {[
          "all",
          "completed",
          "warning",
          "oversold",
          "unmatched",
          "insufficient",
          "error",
        ].map((s) => (
          <Button
            key={s}
            variant={filter === s ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilter(s)}
          >
            {s === "all" ? "Бүгд" : (STATUS_BADGE[s]?.label ?? s)}
            <Badge variant="secondary" className="ml-1">
              {s === "all"
                ? transactions.length
                : transactions.filter((t) => t.status === s).length}
            </Badge>
          </Button>
        ))}
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <table className="min-w-max w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-2 font-medium">Огноо (UTC+8)</th>
              <th className="text-left px-4 py-2 font-medium">Дүн</th>
              <th className="text-left px-4 py-2 font-medium">Тайлбар</th>
              <th className="text-left px-4 py-2 font-medium">Утас</th>
              <th className="text-left px-4 py-2 font-medium">Сугалаа</th>
              <th className="text-left px-4 py-2 font-medium">Тасалбар</th>
              <th className="text-left px-4 py-2 font-medium">Төлөв</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="text-center py-8 text-muted-foreground"
                >
                  Гүйлгээ байхгүй
                </td>
              </tr>
            )}
            {paginated.map((txn) => {
              const isResolved = !!txn.resolved_at;
              const needsAction =
                !isResolved &&
                [
                  "warning",
                  "oversold",
                  "unmatched",
                  "insufficient",
                  "error",
                ].includes(txn.status);
              const badge = STATUS_BADGE[txn.status];
              return (
                <tr key={txn.id} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-2 whitespace-nowrap text-muted-foreground">
                    {formatDate(txn.txn_date)}
                  </td>
                  <td className="px-4 py-2 font-medium whitespace-nowrap">
                    {txn.amount.toLocaleString()}₮
                  </td>
                  <td
                    className="px-4 py-2 whitespace-nowrap text-muted-foreground max-w-[200px] truncate"
                    title={txn.txn_desc}
                  >
                    {txn.txn_desc}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {txn.parsed_phone ?? (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {txn.lottery_name ?? (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {txn.ticket_count ?? (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <Badge variant={badge?.variant ?? "secondary"}>
                      {isResolved && txn.status !== "completed"
                        ? "Шийдвэрлэгдсэн"
                        : (badge?.label ?? txn.status)}
                    </Badge>
                  </td>
                  <td className="px-4 py-2">
                    {needsAction && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setResolving(txn)}
                      >
                        Шийдвэрлэх
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {filtered.length} гүйлгээ · {page} / {totalPages} хуудас
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
            >
              Өмнөх
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page === totalPages}
            >
              Дараах
            </Button>
          </div>
        </div>
      )}

      <ResolveDialog
        txn={resolving}
        lotteries={lotteries}
        onClose={() => setResolving(null)}
      />
    </div>
  );
}
