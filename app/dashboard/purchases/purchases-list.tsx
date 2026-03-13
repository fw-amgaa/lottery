"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const PAGE_SIZE = 20;

function formatDate(date: Date | string) {
  return new Date(date).toLocaleString("mn-MN", { timeZone: "Asia/Ulaanbaatar" });
}

interface Purchase {
  id: string;
  txn_date: string;
  lottery_name: string;
  lottery_code: string;
  phone_number: string;
  amount: number;
  ticket_count: number;
}

export default function PurchasesList({ purchases }: { purchases: Purchase[] }) {
  const [page, setPage] = React.useState(1);
  const totalPages = Math.max(1, Math.ceil(purchases.length / PAGE_SIZE));
  const paginated = purchases.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border overflow-x-auto">
        <table className="min-w-max w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-2 font-medium">Огноо (UTC+8)</th>
              <th className="text-left px-4 py-2 font-medium">Сугалаа</th>
              <th className="text-left px-4 py-2 font-medium">Код</th>
              <th className="text-left px-4 py-2 font-medium">Утас</th>
              <th className="text-left px-4 py-2 font-medium">Дүн</th>
              <th className="text-left px-4 py-2 font-medium">Тасалбар</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-muted-foreground">Худалдан авалт байхгүй</td>
              </tr>
            )}
            {paginated.map((p) => (
              <tr key={p.id} className="border-t hover:bg-muted/30">
                <td className="px-4 py-2 whitespace-nowrap text-muted-foreground">
                  {formatDate(p.txn_date)}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">{p.lottery_name}</td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <Badge variant="outline" className="font-mono">{p.lottery_code}</Badge>
                </td>
                <td className="px-4 py-2 whitespace-nowrap">{p.phone_number}</td>
                <td className="px-4 py-2 font-medium whitespace-nowrap">{Number(p.amount).toLocaleString()}₮</td>
                <td className="px-4 py-2 font-semibold whitespace-nowrap">{p.ticket_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{purchases.length} авалт · {page} / {totalPages} хуудас</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>
              Өмнөх
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>
              Дараах
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
