export type TransactionStatus = "completed" | "warning" | "unmatched" | "error";
export type ParseConfidence = "high" | "medium" | "low" | "none";

export type BankTransaction = {
  id: string;
  jr_no: string;
  jr_item_no: string;
  amount: number;
  txn_date: Date;
  txn_desc: string;
  cont_acnt_no: string | null;
  cont_acnt_name: string | null;
  parsed_code: string | null;
  parsed_phone: string | null;
  parse_confidence: ParseConfidence;
  status: TransactionStatus;
  purchase_id: string | null;
  resolved_at: Date | null;
  resolution_note: string | null;
  created_at: Date;
};

export type BankTransactionWithLottery = BankTransaction & {
  lottery_name: string | null;
  ticket_count: number | null;
};
