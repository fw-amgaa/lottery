import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

async function sendSms(to: string, message: string): Promise<void> {
  const url = process.env.BANK_FETCHER_URL;
  const secret = process.env.CALLBACK_SECRET;
  if (!url || !secret) return;
  try {
    await fetch(`${url}/sms`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": secret },
      body: JSON.stringify({ to, message }),
    });
  } catch (err) {
    console.error("[sms] Failed to send:", err);
  }
}

interface RawTransaction {
  JrNo: string;
  JrItemNo: string;
  Amount: number;
  TxnDate: string;
  TxnDesc: string;
  ContAcntNo: string;
  ContAcntName: string;
}

interface ParseResult {
  code: string | null;
  phone: string | null;
  confidence: "high" | "medium" | "low" | "none";
}

function parseTxnDesc(desc: string, validCodes: string[]): ParseResult {
  const normalized = desc.toUpperCase().replace(/\s+/g, " ").trim();

  // Extract 8-digit Mongolian phone number
  const phoneMatch = normalized.match(/\b(\d{8})\b/);
  const phone = phoneMatch ? phoneMatch[1] : null;

  // Try CODE[sep]PHONE or PHONE[sep]CODE with flexible separators
  const SEP = "[-\\s_:\\/\\.]*";
  const cpPattern = new RegExp(`([A-Z]{2,6})${SEP}(\\d{8})`);
  const pcPattern = new RegExp(`(\\d{8})${SEP}([A-Z]{2,6})`);

  let extractedCode: string | null = null;

  const cpMatch = normalized.match(cpPattern);
  if (cpMatch) extractedCode = cpMatch[1];

  if (!extractedCode) {
    const pcMatch = normalized.match(pcPattern);
    if (pcMatch) extractedCode = pcMatch[2];
  }

  if (extractedCode) {
    if (validCodes.includes(extractedCode)) {
      return { code: extractedCode, phone, confidence: "high" };
    }
    // Code extracted but no direct match — try substring
    const fuzzy = validCodes.find((c) => normalized.includes(c));
    if (fuzzy) return { code: fuzzy, phone, confidence: "medium" };
    return { code: null, phone, confidence: "low" };
  }

  // No code pattern — last resort: any code anywhere in string
  const anywhere = validCodes.find((c) => normalized.includes(c));
  if (anywhere) return { code: anywhere, phone, confidence: "medium" };

  return { code: null, phone, confidence: "none" };
}

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (apiKey !== process.env.CALLBACK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const transactions: RawTransaction[] = body.transactions ?? [];

  if (transactions.length === 0) {
    return NextResponse.json({ processed: 0, flagged: 0 });
  }

  const codesResult = await pool.query(
    "SELECT id, code, price, name, total_tickets, sold_tickets FROM lottery_items WHERE code IS NOT NULL"
  );
  const lotteries = codesResult.rows as {
    id: string;
    code: string;
    price: number;
    name: string;
    total_tickets: number;
    sold_tickets: number;
  }[];
  const validCodes = lotteries.map((l) => l.code);

  let processed = 0;
  let flagged = 0;

  for (const txn of transactions) {
    // Idempotency check
    const exists = await pool.query(
      "SELECT id FROM bank_transactions WHERE jr_no = $1 AND jr_item_no = $2",
      [txn.JrNo, txn.JrItemNo]
    );
    if (exists.rows.length > 0) continue;

    const { code, phone, confidence } = parseTxnDesc(txn.TxnDesc, validCodes);
    const lottery = code ? lotteries.find((l) => l.code === code) : null;

    let status: string;
    let purchaseId: string | null = null;

    if (!phone) {
      status = "error";
    } else if (!lottery) {
      status = "unmatched";
    } else {
      const requested = Math.floor(txn.Amount / lottery.price);
      const remainder = txn.Amount % lottery.price;
      const remaining = lottery.total_tickets - lottery.sold_tickets;

      // Amount too low for even 1 ticket
      if (requested < 1) {
        status = "insufficient";
        await sendSms(
          phone,
          `Таны илгээсэн ${txn.Amount.toLocaleString()}₮ дүн "${lottery.name}" сугалааны нэг тасалбарын үнэ ${lottery.price.toLocaleString()}₮-с бага байна. Зөв дүнгээр дахин илгээнэ үү.`
        );
      } else {
        // Cap at remaining tickets if oversold
        const ticketCount = Math.min(requested, remaining);
        const isOversold = requested > remaining;
        const hasRemainder = remainder > 0 && !isOversold;

        if (isOversold && remaining === 0) {
          // Lottery is completely sold out
          status = "insufficient";
          await sendSms(
            phone,
            `"${lottery.name}" сугалааны тасалбар дууссан байна. Буцаан олголтын талаар бидэнтэй холбоо барина уу.`
          );
        } else {
          status = isOversold ? "oversold" : hasRemainder ? "warning" : "completed";

          const pr = await pool.query(
            `INSERT INTO purchases
               (lottery_item_id, phone_number, amount, ticket_count, jr_no, jr_item_no, txn_date, txn_desc)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             ON CONFLICT (jr_no, jr_item_no) DO NOTHING
             RETURNING id`,
            [lottery.id, phone, txn.Amount, ticketCount,
             txn.JrNo, txn.JrItemNo, txn.TxnDate, txn.TxnDesc]
          );

          if (pr.rows.length > 0) {
            purchaseId = pr.rows[0].id;
            await pool.query(
              "UPDATE lottery_items SET sold_tickets = sold_tickets + $1, updated_at = NOW() WHERE id = $2",
              [ticketCount, lottery.id]
            );

            if (isOversold) {
              const extraAmount = (requested - remaining) * lottery.price + remainder;
              await sendSms(
                phone,
                `Та "${lottery.name}" сугалаанд ${ticketCount} тасалбар авлаа. Илүү илгээсэн ${extraAmount.toLocaleString()}₮-ийг буцаан олгох талаар удахгүй холбоо барих болно.`
              );
            } else {
              await sendSms(
                phone,
                `Та "${lottery.name}" сугалаанд ${ticketCount} тасалбар амжилттай бүртгүүллээ! Азтай байгаарай!`
              );
            }
          }
        }
      }
    }

    const txnRow = await pool.query(
      `INSERT INTO bank_transactions
         (jr_no, jr_item_no, amount, txn_date, txn_desc, cont_acnt_no, cont_acnt_name,
          parsed_code, parsed_phone, parse_confidence, status, purchase_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       ON CONFLICT (jr_no, jr_item_no) DO NOTHING
       RETURNING id`,
      [
        txn.JrNo,
        txn.JrItemNo,
        txn.Amount,
        txn.TxnDate,
        txn.TxnDesc,
        txn.ContAcntNo,
        txn.ContAcntName,
        code,
        phone,
        confidence,
        status,
        purchaseId,
      ]
    );

    if (txnRow.rows.length > 0 && purchaseId) {
      await pool.query(
        "UPDATE purchases SET bank_transaction_id = $1 WHERE id = $2",
        [txnRow.rows[0].id, purchaseId]
      );
    }

    if (status === "completed" || status === "warning") processed++;
    else flagged++;
  }

  return NextResponse.json({ processed, flagged });
}
