import type { Metadata } from "next";
import { ReportsView } from "@/features/reports/reports-view";

export const metadata: Metadata = { title: "Relatórios" };

export default function Page() {
  return <ReportsView />;
}
