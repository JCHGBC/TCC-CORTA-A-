"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, MailCheck, Mail } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { notify } from "@/lib/toast";
import { recoverPasswordSchema, type RecoverPasswordFormValues } from "@/lib/validations";
import { authService } from "@/services";

export function RecoverPasswordForm() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RecoverPasswordFormValues>({
    resolver: zodResolver(recoverPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: RecoverPasswordFormValues) {
    try {
      await authService.requestPasswordReset(values.email);
      setSentTo(values.email);
    } catch (error) {
      notify.error(error);
    }
  }

  // Estado de sucesso
  if (sentTo) {
    return (
      <div className="text-center animate-fade-in">
        <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-brand-100 text-brand-600">
          <MailCheck className="size-8" />
        </span>
        <h1 className="mt-6 text-2xl font-bold text-slate-900">Verifique seu e-mail</h1>
        <p className="mt-2 text-slate-500">
          Se existir uma conta com <strong className="text-slate-700">{sentTo}</strong>, você receberá um link para criar uma nova senha
          em alguns minutos.
        </p>
        <ButtonLink href="/login" fullWidth size="lg" className="mt-8">
          Voltar para o login
        </ButtonLink>
        <button type="button" onClick={() => setSentTo(null)} className="mt-4 text-sm font-medium text-brand-700 hover:underline">
          Não recebeu? Tentar outro e-mail
        </button>
      </div>
    );
  }

  return (
    <div>
      <Link href="/login" className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800">
        <ArrowLeft className="size-4" /> Voltar para o login
      </Link>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Esqueceu a senha?</h1>
      <p className="mt-2 text-slate-500">Sem problemas! Informe seu e-mail e enviaremos as instruções para redefini-la.</p>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-4">
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
        <Button type="submit" fullWidth size="lg" isLoading={isSubmitting} loadingText="Enviando...">
          Enviar instruções
        </Button>
      </form>
    </div>
  );
}
