"use server";

import { pool } from "@/lib/db";
import type {
  LotteryItem,
  InsertLotteryItem,
  UpdateLotteryItem,
} from "@/lib/lottery-items";
import { revalidatePath } from "next/cache";

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ";

async function generateUniqueCode(): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt++) {
    const code = Array.from(
      { length: 4 },
      () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
    ).join("");
    const result = await pool.query(
      "SELECT id FROM lottery_items WHERE code = $1",
      [code]
    );
    if (result.rows.length === 0) return code;
  }
  throw new Error("Could not generate unique code");
}

export async function getLotteryItems(): Promise<LotteryItem[]> {
  const result = await pool.query(
    "SELECT * FROM lottery_items ORDER BY created_at DESC"
  );
  return result.rows;
}

export async function getLotteryItem(id: string): Promise<LotteryItem | null> {
  const result = await pool.query(
    "SELECT * FROM lottery_items WHERE id = $1",
    [id]
  );
  return result.rows[0] ?? null;
}

export async function insertLotteryItem(
  data: InsertLotteryItem
): Promise<LotteryItem> {
  const code = await generateUniqueCode();
  const result = await pool.query(
    `INSERT INTO lottery_items (name, price, bank_account_number, total_tickets, sold_tickets, google_sheet_url, facebook_url, image_url, code)
     VALUES ($1, $2, NULL, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      data.name,
      data.price,
      data.total_tickets,
      data.sold_tickets ?? 0,
      data.google_sheet_url ?? null,
      data.facebook_url ?? null,
      data.image_url ?? null,
      code,
    ]
  );

  revalidatePath("/dashboard/lottery-items");
  return result.rows[0];
}

export async function updateLotteryItem(
  id: string,
  data: UpdateLotteryItem
): Promise<LotteryItem> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      fields.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const result = await pool.query(
    `UPDATE lottery_items SET ${fields.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  revalidatePath("/dashboard/lottery-items");
  return result.rows[0];
}

export async function deleteLotteryItem(id: string): Promise<void> {
  await pool.query("DELETE FROM lottery_items WHERE id = $1", [id]);
  revalidatePath("/dashboard/lottery-items");
}
