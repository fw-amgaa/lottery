"use server";

import { pool } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { BankTransactionWithLottery } from "@/lib/bank-transactions";
import { sendSms } from "@/lib/sms";

export async function getBankTransactions(): Promise<BankTransactionWithLottery[]> {
  const result = await pool.query(`
    SELECT bt.*,
           li.name AS lottery_name,
           p.ticket_count
    FROM bank_transactions bt
    LEFT JOIN purchases p ON p.id = bt.purchase_id
    LEFT JOIN lottery_items li ON li.id = p.lottery_item_id
    ORDER BY bt.txn_date DESC
    LIMIT 200
  `);
  return result.rows;
}

export async function getFlaggedTransactions(): Promise<BankTransactionWithLottery[]> {
  const result = await pool.query(`
    SELECT bt.*,
           li.name AS lottery_name,
           p.ticket_count
    FROM bank_transactions bt
    LEFT JOIN purchases p ON p.id = bt.purchase_id
    LEFT JOIN lottery_items li ON li.id = p.lottery_item_id
    WHERE bt.status IN ('warning', 'oversold', 'unmatched', 'insufficient', 'error')
      AND bt.resolved_at IS NULL
    ORDER BY bt.txn_date DESC
  `);
  return result.rows;
}

export async function resolveWarning(
  txnId: string,
  note: string
): Promise<void> {
  await pool.query(
    `UPDATE bank_transactions SET resolved_at = NOW(), resolution_note = $1 WHERE id = $2`,
    [note || null, txnId]
  );
  revalidatePath("/dashboard/transactions");
  revalidatePath("/dashboard");
}

export async function resolveUnmatched(
  txnId: string,
  lotteryItemId: string,
  phone: string,
  note: string
): Promise<{ ticketCount: number }> {
  const txnResult = await pool.query(
    "SELECT * FROM bank_transactions WHERE id = $1",
    [txnId]
  );
  if (txnResult.rows.length === 0) throw new Error("Transaction not found");
  const txn = txnResult.rows[0];

  const lotteryResult = await pool.query(
    "SELECT id, price, name, total_tickets, sold_tickets FROM lottery_items WHERE id = $1",
    [lotteryItemId]
  );
  if (lotteryResult.rows.length === 0) throw new Error("Lottery not found");
  const lottery = lotteryResult.rows[0];

  const ticketCount = Math.floor(txn.amount / lottery.price);
  if (ticketCount < 1) throw new Error("Amount too low for selected lottery");

  // Insert purchase; if already exists (conflict), update bank_transaction_id so we get the id back
  const pr = await pool.query(
    `INSERT INTO purchases
       (lottery_item_id, phone_number, amount, ticket_count, jr_no, jr_item_no, txn_date, txn_desc, bank_transaction_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     ON CONFLICT (jr_no, jr_item_no) DO UPDATE
       SET bank_transaction_id = EXCLUDED.bank_transaction_id
     RETURNING id, (xmax = 0) AS inserted`,
    [lotteryItemId, phone, txn.amount, ticketCount,
     txn.jr_no, txn.jr_item_no, txn.txn_date, txn.txn_desc, txnId]
  );

  const purchaseId = pr.rows[0].id;
  const isNewPurchase = pr.rows[0].inserted;

  const startTicket = isNewPurchase ? lottery.sold_tickets : lottery.sold_tickets - ticketCount;

  // Only increment sold_tickets for a fresh insert (not a re-resolve of already-processed txn)
  if (isNewPurchase) {
    await pool.query(
      "UPDATE lottery_items SET sold_tickets = sold_tickets + $1, updated_at = NOW() WHERE id = $2",
      [ticketCount, lotteryItemId]
    );
  }

  const pad = String(lottery.total_tickets).length;
  const fmt = (n: number) => String(n).padStart(pad, "0");
  const ticketNums = ticketCount === 1
    ? fmt(startTicket)
    : `${fmt(startTicket)}-${fmt(startTicket + ticketCount - 1)}`;

  // Always mark transaction completed and send SMS
  await pool.query(
    `UPDATE bank_transactions SET
       status = 'completed', purchase_id = $1, resolved_at = NOW(), resolution_note = $2,
       parsed_phone = $3
     WHERE id = $4`,
    [purchaseId, note || null, phone, txnId]
  );
  await sendSms(
    phone,
    `Та "${lottery.name}" сугалаанд ${ticketCount} тасалбар амжилттай худалдан авлаа.\nТаны сугалааны дугаар ${ticketNums}\nТанд амжилт хүсье!`
  );

  revalidatePath("/dashboard/transactions");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/lottery-items");
  revalidatePath(`/lottery-item/${lotteryItemId}`);
  return { ticketCount };
}
