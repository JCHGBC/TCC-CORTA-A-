"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlert, Mail, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input, PasswordInput } from "@/components/ui/input";
import { DEMO_ACCOUNT } from "@/config/constants";
import { notify } from "@/lib/toast";
import { firstName, getErrorMessage } from "@/lib/utils";
import { loginSchema, type LoginFormValues } from "@/lib/validations";
import { useAuth } from "./auth-context";

/** RF-02 — Login do cliente */
export function LoginForm() {
  const { login } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: true },
  });

  async function onSubmit(values: LoginFormValues) {
    setFormError(null);
    try {
      const user = await login(values.email, values.password, values.remember);
      notify.success(`Bem-vindo de volta, ${firstName(user.name)}!`);
      // O redirecionamento para o painel é feito pelo RedirectIfAuthenticated
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  function fillDemo() {
    setValue("email", DEMO_ACCOUNT.email, { shouldValidate: true });
    setValue("password", DEMO_ACCOUNT.password, { shouldValidate: true });
  }

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Entrar</h1>
      <p className="mt-2 text-slate-500">Acesse sua conta para continuar controlando suas finanças.</p>

      {formError && (
        <div role="alert" className="mt-6 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 animate-fade-in">
          <CircleAlert className="size-4.5 shrink-0" />
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-4">
        <Input
          id="email"
          type="email"
          label="E-mail"
          placeholder="seu@email.com"
          autoComplete="email"
          leftIcon={<Mail />}
          error={errors.email?.message}
          {...register("email")}
        />
        <PasswordInput
          id="password"
          label="Senha"
          placeholder="Digite sua senha"
          autoComplete="current-password"
          error={errors.password?.message}
          labelAction={
            <Link href="/recuperar-senha" className="text-sm font-medium text-brand-700 hover:underline">
              Esqueceu a senha?
            </Link>
          }
          {...register("password")}
        />
        <Checkbox id="remember" label="Manter conectado" {...register("remember")} />
        <Button type="submit" fullWidth size="lg" isLoading={isSubmitting} loadingText="Entrando...">
          Entrar
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        ou
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <Button variant="outline" fullWidth onClick={fillDemo} leftIcon={<Sparkles className="size-4 text-brand-600" />}>
        Usar conta de demonstração
      </Button>

      <p className="mt-8 text-center text-sm text-slate-500">
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="font-semibold text-brand-700 hover:underline">
          Cadastre-se grátis
        </Link>
      </p>
    </div>
  );
}
