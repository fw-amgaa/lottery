export type LotteryItem = {
  id: string;
  name: string;
  price: number;
  bank_account_number: string;
  total_tickets: number;
  sold_tickets: number;
  google_sheet_url: string | null;
  facebook_url: string | null;
  image_url: string | null;
  created_at: Date;
  updated_at: Date;
};

export type InsertLotteryItem = {
  name: string;
  price: number;
  bank_account_number: string;
  total_tickets: number;
  sold_tickets?: number;
  google_sheet_url?: string | null;
  facebook_url?: string | null;
  image_url?: string | null;
};

export type UpdateLotteryItem = Partial<InsertLotteryItem>;
