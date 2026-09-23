import { AppShell } from "@/components/layout/app-shell";
import { RequireAuth } from "@/features/auth/guards";

/** Todas as páginas deste grupo exigem login (RNF-02). */
export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <RequireAuth>
      <AppShell>{children}</AppShell>
    </RequireAuth>
  );
}
