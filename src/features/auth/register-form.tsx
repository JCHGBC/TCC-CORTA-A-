"use client";

import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Phone, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input, PasswordInput } from "@/components/ui/input";
import { maskPhone, withMask } from "@/lib/masks";
import { notify } from "@/lib/toast";
import { firstName } from "@/lib/utils";
import { registerSchema, type RegisterFormValues } from "@/lib/validations";
import { ServiceError } from "@/services";
import { useAuth } from "./auth-context";
import { PasswordStrength } from "./password-strength";

/** RF-01 — Cadastrar cliente */
export function RegisterForm() {
  const { register: createAccount } = useAuth();
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: { name: "", email: "", phone: "", password: "", confirmPassword: "", acceptTerms: false },
  });

  const password = useWatch({ control, name: "password" });

  async function onSubmit(values: RegisterFormValues) {
    try {
      const user = await createAccount({
        name: values.name,
        email: values.email,
        phone: values.phone,
        password: values.password,
      });
      notify.success(`Conta criada! Bem-vindo, ${firstName(user.name)}!`, "Já criamos algumas categorias para você começar.");
    } catch (error) {
      // Erros por campo vindos da API (ex.: e-mail já cadastrado) aparecem embaixo do campo
      if (error instanceof ServiceError && Object.keys(error.fields).length > 0) {
        for (const [field, message] of Object.entries(error.fields)) {
          if (field in values) setError(field as keyof RegisterFormValues, { message });
        }
      } else {
        notify.error(error, "Não foi possível criar a conta.");
      }
    }
  }

  return (
    <div className="py-4">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Criar conta</h1>
      <p className="mt-2 text-slate-500">É rápido e gratuito. Comece a organizar suas finanças hoje.</p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-4">
        <Input
          id="name"
          label="Nome completo"
          required
          placeholder="Como você se chama?"
          autoComplete="name"
          leftIcon={<UserRound />}
          error={errors.name?.message}
          {...register("name")}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="email"
            type="email"
            label="E-mail"
            required
            placeholder="seu@email.com"
            autoComplete="email"
            leftIcon={<Mail />}
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            id="phone"
            type="tel"
            label="Telefone"
            required
            inputMode="numeric"
            placeholder="(00) 00000-0000"
            autoComplete="tel-national"
            leftIcon={<Phone />}
            error={errors.phone?.message}
            {...withMask(register("phone"), maskPhone)}
          />
        </div>
        <PasswordInput
          id="password"
          label="Senha"
          required
          placeholder="Crie uma senha"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <PasswordStrength password={password} />
        <PasswordInput
          id="confirmPassword"
          label="Confirmar senha"
          required
          placeholder="Digite a senha novamente"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
        <Checkbox
          id="acceptTerms"
          label={
            <>
              Li e aceito os <span className="font-medium text-brand-700">termos de uso</span> e a{" "}
              <span className="font-medium text-brand-700">política de privacidade</span>.
            </>
          }
          error={errors.acceptTerms?.message}
          {...register("acceptTerms")}
        />
        <Button type="submit" fullWidth size="lg" isLoading={isSubmitting} loadingText="Criando conta...">
          Criar minha conta
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500">
        Já tem uma conta?{" "}
        <Link href="/login" className="font-semibold text-brand-700 hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
