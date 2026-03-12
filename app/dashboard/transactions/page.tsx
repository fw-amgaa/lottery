import { getBankTransactions } from "./actions";
import { getLotteryItems } from "@/app/dashboard/lottery-items/actions";
import TransactionsList from "./transactions-list";

export default async function TransactionsPage() {
  const [transactions, lotteries] = await Promise.all([
    getBankTransactions(),
    getLotteryItems(),
  ]);

  return (
    <div className="flex flex-col gap-4 p-4 pt-0">
      <div>
        <h1 className="text-xl font-semibold">Bank Transactions</h1>
        <p className="text-muted-foreground text-sm">All incoming transactions from the bank account</p>
      </div>
      <TransactionsList transactions={transactions} lotteries={lotteries} />
    </div>
  );
}
