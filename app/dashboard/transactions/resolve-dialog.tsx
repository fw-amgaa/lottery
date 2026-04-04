"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BankTransactionWithLottery } from "@/lib/bank-transactions";
import type { LotteryItem } from "@/lib/lottery-items";
import { resolveWarning, resolveUnmatched, ignoreTransaction } from "./actions";
import { toast } from "sonner";

interface Props {
  txn: BankTransactionWithLottery | null;
  lotteries: LotteryItem[];
  onClose: () => void;
}

export default function ResolveDialog({ txn, lotteries, onClose }: Props) {
  const [lotteryId, setLotteryId] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [note, setNote] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (txn) {
      setPhone(txn.parsed_phone ?? "");
      setLotteryId("");
      setNote("");
    }
  }, [txn]);

  const selectedLottery = lotteries.find((l) => l.id === lotteryId);
  const estimatedTickets =
    selectedLottery && txn
      ? Math.floor(txn.amount / selectedLottery.price)
      : null;

  async function handleSubmit() {
    if (!txn) return;
    setLoading(true);
    try {
      if (txn.status === "warning") {
        await resolveWarning(txn.id, note);
        toast.success("Гүйлгээ шийдвэрлэгдлээ");
      } else {
        if (!lotteryId) { toast.error("Сугалаа сонгоно уу"); setLoading(false); return; }
        if (!phone) { toast.error("Утасны дугаар оруулна уу"); setLoading(false); return; }
        const { ticketCount } = await resolveUnmatched(txn.id, lotteryId, phone, note);
        toast.success(`Шийдвэрлэгдлээ — ${ticketCount} тасалбар олгогдлоо`);
      }
      onClose();
    } catch (err) {
      toast.error(String(err));
    } finally {
      setLoading(false);
    }
  }

  if (!txn) return null;

  const isWarning = txn.status === "warning";

  return (
    <AlertDialog open={!!txn} onOpenChange={(open) => { if (!open) onClose(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isWarning ? "Гүйлгээ шалгах" : "Гүйлгээ шийдвэрлэх"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isWarning
              ? `Худалдан авалт үүссэн (${txn.ticket_count} тасалбар). Дүн: ${txn.amount.toLocaleString()}₮ — үлдэгдэл бий. Анхааруулгыг хаах уу?`
              : `Дүн: ${txn.amount.toLocaleString()}₮ · Тайлбар: "${txn.txn_desc}"`}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <FieldGroup>
          {!isWarning && (
            <>
              <Field>
                <FieldLabel>Сугалаа сонгох</FieldLabel>
                <Select value={lotteryId} onValueChange={(v) => setLotteryId(v ?? "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Сугалаа сонгох..." />
                  </SelectTrigger>
                  <SelectContent>
                    {lotteries.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.name} ({l.code}) — {l.price.toLocaleString()}₮/тасалбар
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {estimatedTickets !== null && (
                  <p className="text-sm text-muted-foreground mt-1">
                    → {estimatedTickets} тасалбар олгогдоно
                  </p>
                )}
              </Field>
              <Field>
                <FieldLabel>Утасны дугаар</FieldLabel>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="99887766"
                  maxLength={8}
                />
              </Field>
            </>
          )}
          <Field>
            <FieldLabel>Тэмдэглэл (заавал биш)</FieldLabel>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Тэмдэглэл..."
            />
          </Field>
        </FieldGroup>

        <AlertDialogFooter className="mt-4">
          <Field orientation="horizontal">
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Хадгалж байна..." : isWarning ? "Баталгаажуулах" : "Шийдвэрлэх"}
            </Button>
            <Button
              variant="outline"
              disabled={loading}
              onClick={async () => {
                if (!txn) return;
                setLoading(true);
                try {
                  await ignoreTransaction(txn.id, note);
                  toast.success("Гүйлгээ орхигдлоо");
                  onClose();
                } catch (err) {
                  toast.error(String(err));
                } finally {
                  setLoading(false);
                }
              }}
            >
              Орхих
            </Button>
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Цуцлах
            </Button>
          </Field>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
