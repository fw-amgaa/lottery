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
import { resolveWarning, resolveUnmatched } from "./actions";
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
        toast.success("Transaction marked as resolved");
      } else {
        if (!lotteryId) { toast.error("Select a lottery"); setLoading(false); return; }
        if (!phone) { toast.error("Enter a phone number"); setLoading(false); return; }
        const { ticketCount } = await resolveUnmatched(txn.id, lotteryId, phone, note);
        toast.success(`Resolved — ${ticketCount} ticket(s) assigned`);
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
            {isWarning ? "Review transaction" : "Resolve transaction"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isWarning
              ? `Purchase already created (${txn.ticket_count} tickets). Amount ${txn.amount.toLocaleString()}₮ — remainder exists. Confirm to dismiss warning.`
              : `Amount: ${txn.amount.toLocaleString()}₮ · Desc: "${txn.txn_desc}"`}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <FieldGroup>
          {!isWarning && (
            <>
              <Field>
                <FieldLabel>Assign to lottery</FieldLabel>
                <Select value={lotteryId} onValueChange={setLotteryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select lottery..." />
                  </SelectTrigger>
                  <SelectContent>
                    {lotteries.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.name} ({l.code}) — {l.price.toLocaleString()}₮/ticket
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {estimatedTickets !== null && (
                  <p className="text-sm text-muted-foreground mt-1">
                    → {estimatedTickets} ticket(s) will be assigned
                  </p>
                )}
              </Field>
              <Field>
                <FieldLabel>Phone number</FieldLabel>
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
            <FieldLabel>Note (optional)</FieldLabel>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Resolution note..."
            />
          </Field>
        </FieldGroup>

        <AlertDialogFooter className="mt-4">
          <Field orientation="horizontal">
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving..." : isWarning ? "Confirm & dismiss" : "Resolve"}
            </Button>
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
          </Field>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
