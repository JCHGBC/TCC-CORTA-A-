import type { Metadata } from "next";
import { TransactionsView } from "@/features/transactions/transactions-view";

export const metadata: Metadata = { title: "Entradas" };

export default function Page() {
  return <TransactionsView type="entrada" />;
}
