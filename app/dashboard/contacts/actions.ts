"use server";

import { pool } from "@/lib/db";
import { sendSms, identifyOperator } from "@/lib/sms";

export type Contact = {
  phone_number: string;
  operator: string;
  total_tickets: number;
  total_spent: number;
};

export async function getContacts(): Promise<Contact[]> {
  const result = await pool.query(`
    SELECT
      phone_number,
      SUM(ticket_count)::int AS total_tickets,
      SUM(amount)::int       AS total_spent
    FROM purchases
    GROUP BY phone_number
    ORDER BY total_tickets DESC
  `);
  return result.rows.map((row) => ({
    ...row,
    operator: identifyOperator(row.phone_number),
  }));
}

// Emoji detection (Extended_Pictographic covers all emoji)
const EMOJI_RE = /\p{Extended_Pictographic}/u;

export type MassSmsResult = {
  sent: number;
  failed: number;
  errors: Array<{ phone: string; error: string }>;
};

export async function sendMassSms(
  phones: string[],
  message: string
): Promise<{ ok: true; result: MassSmsResult } | { ok: false; error: string }> {
  if (!message.trim()) {
    return { ok: false, error: "Мессеж хоосон байна" };
  }
  if (EMOJI_RE.test(message)) {
    return { ok: false, error: "Мессежинд emoji ашиглах боломжгүй" };
  }
  if (message.length > 320) {
    return { ok: false, error: "Мессеж 320 тэмдэгтээс хэтрэхгүй байх ёстой" };
  }
  if (phones.length === 0) {
    return { ok: false, error: "Хүлээн авагч сонгоогүй байна" };
  }

  let sent = 0;
  let failed = 0;
  const errors: Array<{ phone: string; error: string }> = [];

  for (const phone of phones) {
    const result = await sendSms(phone, message);
    if (result.ok) {
      sent++;
    } else {
      failed++;
      errors.push({ phone, error: result.error ?? "Тодорхойгүй алдаа" });
    }
  }

  return { ok: true, result: { sent, failed, errors } };
}
