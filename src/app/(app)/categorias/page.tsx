import type { Metadata } from "next";
import { CategoriesView } from "@/features/categories/categories-view";

export const metadata: Metadata = { title: "Categorias" };

export default function Page() {
  return <CategoriesView />;
}
