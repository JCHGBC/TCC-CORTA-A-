import type { Metadata } from "next";
import { TransactionsView } from "@/features/transactions/transactions-view";

export const metadata: Metadata = { title: "Saídas" };

export default function Page() {
  return <TransactionsView type="saida" />;
}
