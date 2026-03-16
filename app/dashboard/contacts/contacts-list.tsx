"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import type { Contact, MassSmsResult } from "./actions";
import { sendMassSms } from "./actions";

const OPERATOR_BADGE: Record<string, string> = {
  unitel: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  skytel: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  gmobile: "bg-green-500/10 text-green-400 border-green-500/20",
  mobicom: "bg-red-500/10 text-red-400 border-red-500/20",
  unknown: "bg-muted text-muted-foreground",
};

const OPERATOR_LABEL: Record<string, string> = {
  unitel: "Unitel",
  skytel: "Skytel",
  gmobile: "G-Mobile",
  mobicom: "Mobicom",
  unknown: "Тодорхойгүй",
};

const MAX_CHARS = 320;

export default function ContactsList({ contacts }: { contacts: Contact[] }) {
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [result, setResult] = React.useState<MassSmsResult | null>(null);
  const [validationError, setValidationError] = React.useState<string | null>(null);

  const allSelected = selected.size === contacts.length && contacts.length > 0;
  const someSelected = selected.size > 0 && !allSelected;

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(contacts.map((c) => c.phone_number)));
    }
  }

  function toggleOne(phone: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(phone)) next.delete(phone);
      else next.add(phone);
      return next;
    });
  }

  function openDialog() {
    setMessage("");
    setResult(null);
    setValidationError(null);
    setDialogOpen(true);
  }

  function handleMessageChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setMessage(e.target.value);
    setValidationError(null);
    setResult(null);
  }

  async function handleSend() {
    // Client-side pre-validation
    if (!message.trim()) {
      setValidationError("Мессеж хоосон байна");
      return;
    }
    // Emoji check
    if (/\p{Extended_Pictographic}/u.test(message)) {
      setValidationError("Мессежинд emoji ашиглах боломжгүй");
      return;
    }
    if (message.length > MAX_CHARS) {
      setValidationError(`Мессеж ${MAX_CHARS} тэмдэгтээс хэтрэхгүй байх ёстой`);
      return;
    }

    setSending(true);
    setValidationError(null);
    try {
      const res = await sendMassSms(Array.from(selected), message);
      if (!res.ok) {
        setValidationError(res.error);
      } else {
        setResult(res.result);
        if (res.result.failed === 0) {
          toast.success(`${res.result.sent} хүнд мессеж амжилттай илгээгдлээ`);
        } else {
          toast.warning(`${res.result.sent} амжилттай, ${res.result.failed} амжилтгүй`);
        }
      }
    } catch {
      setValidationError("Сервертэй холбогдоход алдаа гарлаа");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <span className="text-sm text-muted-foreground">
          {contacts.length} хэрэглэгч
          {selected.size > 0 && ` · ${selected.size} сонгогдсон`}
        </span>
        <Button
          disabled={selected.size === 0}
          onClick={openDialog}
        >
          Масс мессеж илгээх
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-x-auto">
        <table className="min-w-max w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-2 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => { if (el) el.indeterminate = someSelected; }}
                  onChange={toggleAll}
                  className="cursor-pointer"
                />
              </th>
              <th className="text-left px-4 py-2 font-medium">Утас</th>
              <th className="text-left px-4 py-2 font-medium">Оператор</th>
              <th className="text-left px-4 py-2 font-medium">Тасалбар</th>
              <th className="text-left px-4 py-2 font-medium">Нийт дүн</th>
            </tr>
          </thead>
          <tbody>
            {contacts.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-muted-foreground">
                  Хэрэглэгч байхгүй
                </td>
              </tr>
            )}
            {contacts.map((c) => (
              <tr
                key={c.phone_number}
                className="border-t hover:bg-muted/30 cursor-pointer"
                onClick={() => toggleOne(c.phone_number)}
              >
                <td className="px-4 py-2">
                  <input
                    type="checkbox"
                    checked={selected.has(c.phone_number)}
                    onChange={() => toggleOne(c.phone_number)}
                    onClick={(e) => e.stopPropagation()}
                    className="cursor-pointer"
                  />
                </td>
                <td className="px-4 py-2 font-mono whitespace-nowrap">{c.phone_number}</td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                      OPERATOR_BADGE[c.operator] ?? OPERATOR_BADGE.unknown
                    }`}
                  >
                    {OPERATOR_LABEL[c.operator] ?? c.operator}
                  </span>
                </td>
                <td className="px-4 py-2 font-semibold tabular-nums">{c.total_tickets}</td>
                <td className="px-4 py-2 whitespace-nowrap tabular-nums">
                  {Number(c.total_spent).toLocaleString()}₮
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mass SMS Dialog */}
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Масс мессеж — {selected.size} хүлээн авагч
            </AlertDialogTitle>
          </AlertDialogHeader>

          <div className="flex flex-col gap-3 py-1">
            <div className="relative">
              <textarea
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                rows={5}
                placeholder="Мессежээ энд бичнэ үү..."
                value={message}
                onChange={handleMessageChange}
                disabled={sending}
              />
              <span
                className={`absolute bottom-2 right-3 text-xs tabular-nums ${
                  message.length > MAX_CHARS
                    ? "text-destructive"
                    : "text-muted-foreground"
                }`}
              >
                {message.length} / {MAX_CHARS}
              </span>
            </div>

            {message.length > 160 && message.length <= MAX_CHARS && (
              <p className="text-xs text-yellow-500">
                160 тэмдэгтээс их тул олон хэсэгт хуваагдан илгээгдэнэ
              </p>
            )}

            {validationError && (
              <p className="text-sm text-destructive">{validationError}</p>
            )}

            {result && (
              <div className="rounded-md border bg-muted/40 p-3 text-sm flex flex-col gap-1">
                <p className="font-medium">
                  ✓ {result.sent} амжилттай
                  {result.failed > 0 && ` · ✗ ${result.failed} амжилтгүй`}
                </p>
                {result.errors.length > 0 && (
                  <ul className="mt-1 space-y-1 text-xs text-muted-foreground max-h-32 overflow-y-auto">
                    {result.errors.map((e) => (
                      <li key={e.phone} className="font-mono">
                        {e.phone}: {e.error}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={sending}>Хаах</AlertDialogCancel>
            <Button onClick={handleSend} disabled={sending || !!result}>
              {sending ? "Илгээж байна..." : "Илгээх"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
