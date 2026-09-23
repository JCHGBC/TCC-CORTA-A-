import { AuthLayout } from "@/features/auth/auth-layout";
import { RedirectIfAuthenticated } from "@/features/auth/guards";

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <RedirectIfAuthenticated>
      <AuthLayout>{children}</AuthLayout>
    </RedirectIfAuthenticated>
  );
}
