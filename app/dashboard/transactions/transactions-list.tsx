"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { BankTransactionWithLottery } from "@/lib/bank-transactions";
import type { LotteryItem } from "@/lib/lottery-items";
import ResolveDialog from "./resolve-dialog";

const STATUS_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  completed: { label: "Completed", variant: "default" },
  warning: { label: "Warning", variant: "secondary" },
  unmatched: { label: "Unmatched", variant: "outline" },
  error: { label: "Error", variant: "destructive" },
};

interface Props {
  transactions: BankTransactionWithLottery[];
  lotteries: LotteryItem[];
}

export default function TransactionsList({ transactions, lotteries }: Props) {
  const [resolving, setResolving] = React.useState<BankTransactionWithLottery | null>(null);
  const [filter, setFilter] = React.useState<string>("all");

  const filtered = filter === "all" ? transactions : transactions.filter((t) => t.status === filter);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 flex-wrap">
        {["all", "completed", "warning", "unmatched", "error"].map((s) => (
          <Button
            key={s}
            variant={filter === s ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(s)}
          >
            {s === "all" ? "All" : STATUS_BADGE[s]?.label ?? s}
            <Badge variant="secondary" className="ml-1">
              {s === "all" ? transactions.length : transactions.filter((t) => t.status === s).length}
            </Badge>
          </Button>
        ))}
      </div>

      <div className="rounded-lg border overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-2 font-medium">Date</th>
              <th className="text-left px-4 py-2 font-medium">Amount</th>
              <th className="text-left px-4 py-2 font-medium">Description</th>
              <th className="text-left px-4 py-2 font-medium">Phone</th>
              <th className="text-left px-4 py-2 font-medium">Lottery</th>
              <th className="text-left px-4 py-2 font-medium">Tickets</th>
              <th className="text-left px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-8 text-muted-foreground">
                  No transactions
                </td>
              </tr>
            )}
            {filtered.map((txn) => {
              const isResolved = !!txn.resolved_at;
              const needsAction = !isResolved && ["warning", "unmatched", "error"].includes(txn.status);
              const badge = STATUS_BADGE[txn.status];
              return (
                <tr key={txn.id} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-2 whitespace-nowrap text-muted-foreground">
                    {new Date(txn.txn_date).toLocaleString("mn-MN")}
                  </td>
                  <td className="px-4 py-2 font-medium whitespace-nowrap">
                    {txn.amount.toLocaleString()}₮
                  </td>
                  <td className="px-4 py-2 max-w-[200px] truncate text-muted-foreground" title={txn.txn_desc}>
                    {txn.txn_desc}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {txn.parsed_phone ?? <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {txn.lottery_name ?? <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {txn.ticket_count ?? <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-2">
                    <Badge variant={badge?.variant ?? "secondary"}>
                      {isResolved && txn.status !== "completed" ? "Resolved" : badge?.label ?? txn.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-2">
                    {needsAction && (
                      <Button size="sm" variant="outline" onClick={() => setResolving(txn)}>
                        Resolve
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ResolveDialog
        txn={resolving}
        lotteries={lotteries}
        onClose={() => setResolving(null)}
      />
    </div>
  );
}
