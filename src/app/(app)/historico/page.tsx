import type { Metadata } from "next";
import { HistoryView } from "@/features/transactions/history-view";

export const metadata: Metadata = { title: "Histórico" };

export default function Page() {
  return <HistoryView />;
}
