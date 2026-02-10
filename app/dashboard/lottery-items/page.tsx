import { getLotteryItems } from "./actions";
import LotteryItemsList from "./lottery-items-list";

export default async function Page() {
  const items = await getLotteryItems();
  return <LotteryItemsList items={items} />;
}
