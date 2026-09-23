"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Mail, Phone, ShieldCheck, Trash2, UserRound } from "lucide-react";
import { Avatar } from "@/components/layout/user-menu";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input, PasswordInput } from "@/components/ui/input";
import { useAuth, useCurrentUser } from "@/features/auth/auth-context";
import { PasswordStrength } from "@/features/auth/password-strength";
import { formatDateLong } from "@/lib/formatters";
import { maskPhone, withMask } from "@/lib/masks";
import { notify } from "@/lib/toast";
import {
  changePasswordSchema,
  profileSchema,
  type ChangePasswordFormValues,
  type ProfileFormValues,
} from "@/lib/validations";
import { authService } from "@/services";

export function ProfileView() {
  const user = useCurrentUser();

  return (
    <div className="animate-fade-in">
      <PageHeader title="Meu perfil" description="Gerencie seus dados pessoais e a segurança da sua conta." />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="h-fit">
          <CardContent className="flex flex-col items-center py-8 text-center">
            <Avatar name={user.name} className="size-20 text-2xl" />
            <h2 className="mt-4 text-lg font-semibold text-slate-900">{user.name}</h2>
            <p className="text-sm text-slate-500">{user.email}</p>
            <p className="mt-4 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
              Membro desde {formatDateLong(user.createdAt.slice(0, 10))}
            </p>
            <div className="mt-6 flex items-start gap-2 rounded-xl bg-brand-50 p-3 text-left text-xs text-brand-800">
              <ShieldCheck className="size-4 shrink-0" />
              Seus dados financeiros são visíveis apenas para você, mediante login e senha.
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <ProfileForm />
          <ChangePasswordForm />
          <DangerZone />
        </div>
      </div>
    </div>
  );
}

function ProfileForm() {
  const user = useCurrentUser();
  const { updateProfile } = useAuth();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name, email: user.email, phone: user.phone },
  });

  async function onSubmit(values: ProfileFormValues) {
    try {
      const updated = await updateProfile(values);
      reset({ name: updated.name, email: updated.email, phone: updated.phone });
      notify.success("Dados atualizados com sucesso!");
    } catch (error) {
      notify.error(error);
    }
  }

  return (
    <Card>
      <CardHeader title="Dados pessoais" icon={<UserRound />} />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4 sm:grid-cols-2">
          <Input
            id="profile-name"
            label="Nome completo"
            required
            autoComplete="name"
            leftIcon={<UserRound />}
            containerClassName="sm:col-span-2"
            error={errors.name?.message}
            {...register("name")}
          />
          <Input
            id="profile-email"
            type="email"
            label="E-mail"
            required
            autoComplete="email"
            leftIcon={<Mail />}
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            id="profile-phone"
            type="tel"
            label="Telefone"
            required
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="(00) 00000-0000"
            leftIcon={<Phone />}
            error={errors.phone?.message}
            {...withMask(register("phone"), maskPhone)}
          />
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button variant="ghost" disabled={!isDirty || isSubmitting} onClick={() => reset()}>
              Descartar
            </Button>
            <Button type="submit" disabled={!isDirty} isLoading={isSubmitting} loadingText="Salvando...">
              Salvar alterações
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function ChangePasswordForm() {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });
  const newPassword = useWatch({ control, name: "newPassword" });

  async function onSubmit(values: ChangePasswordFormValues) {
    try {
      await authService.changePassword(values.currentPassword, values.newPassword);
      reset();
      notify.success("Senha alterada com sucesso!");
    } catch (error) {
      notify.error(error);
    }
  }

  return (
    <Card>
      <CardHeader title="Alterar senha" description="Use uma senha forte e que você não usa em outros sites." icon={<KeyRound />} />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4 sm:grid-cols-2">
          <PasswordInput
            id="current-password"
            label="Senha atual"
            required
            autoComplete="current-password"
            containerClassName="sm:col-span-2"
            error={errors.currentPassword?.message}
            {...register("currentPassword")}
          />
          <div className="space-y-2">
            <PasswordInput
              id="new-password"
              label="Nova senha"
              required
              autoComplete="new-password"
              error={errors.newPassword?.message}
              {...register("newPassword")}
            />
            <PasswordStrength password={newPassword} />
          </div>
          <PasswordInput
            id="confirm-new-password"
            label="Confirmar nova senha"
            required
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />
          <div className="flex justify-end sm:col-span-2">
            <Button type="submit" isLoading={isSubmitting} loadingText="Alterando...">
              Alterar senha
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function DangerZone() {
  const { deleteAccount } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteAccount();
      notify.success("Conta excluída.", "Todos os seus dados foram apagados.");
      router.replace("/");
    } catch (error) {
      notify.error(error);
      setIsDeleting(false);
    }
  }

  return (
    <Card className="border-rose-200">
      <CardHeader title="Excluir conta" description="Apaga permanentemente sua conta e todas as suas movimentações e metas." icon={<Trash2 className="text-rose-600" />} />
      <CardContent className="flex justify-end">
        <Button variant="danger-outline" onClick={() => setOpen(true)}>
          Excluir minha conta
        </Button>
      </CardContent>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Excluir sua conta?"
        description="Esta ação não pode ser desfeita. Todas as suas entradas, saídas, categorias e metas serão apagadas."
        confirmLabel="Sim, excluir conta"
      />
    </Card>
  );
}
