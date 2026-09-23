import type { Metadata } from "next";
import { RegisterForm } from "@/features/auth/register-form";

export const metadata: Metadata = { title: "Criar conta" };

export default function Page() {
  return <RegisterForm />;
}
