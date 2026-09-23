import type { Metadata } from "next";
import { RecoverPasswordForm } from "@/features/auth/recover-password-form";

export const metadata: Metadata = { title: "Recuperar senha" };

export default function Page() {
  return <RecoverPasswordForm />;
}
