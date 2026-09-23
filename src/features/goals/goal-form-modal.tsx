"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, PiggyBank, Target, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ColorPicker } from "@/components/ui/color-picker";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { COLOR_OPTIONS } from "@/config/constants";
import { useCurrentUser } from "@/features/auth/auth-context";
import { toISODate } from "@/lib/formatters";
import { centsToMasked, maskCurrency, parseCurrency, withMask } from "@/lib/masks";
import { notify } from "@/lib/toast";
import { goalSchema, type GoalFormValues } from "@/lib/validations";
import { goalService } from "@/services";
import type { Goal } from "@/types";

interface GoalFormModalProps {
  open: boolean;
  onClose: () => void;
  goal?: Goal | null;
}

function defaultDeadline() {
  const date = new Date();
  date.setMonth(date.getMonth() + 6);
  return toISODate(date);
}

export function GoalFormModal({ open, onClose, goal }: GoalFormModalProps) {
  const user = useCurrentUser();
  const isEditing = !!goal;

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: goal?.name ?? "",
      description: goal?.description ?? "",
      targetAmount: goal ? centsToMasked(goal.targetAmount) : "",
      currentAmount: goal ? centsToMasked(goal.currentAmount) : "",
      deadline: goal?.deadline ?? defaultDeadline(),
      color: goal?.color ?? COLOR_OPTIONS[0],
    },
  });

  async function onSubmit(values: GoalFormValues) {
    const input = {
      name: values.name,
      description: values.description,
      targetAmount: parseCurrency(values.targetAmount),
      currentAmount: parseCurrency(values.currentAmount),
      deadline: values.deadline,
      color: values.color,
    };
    try {
      if (goal) {
        await goalService.update(user.id, goal.id, input);
        notify.success("Meta atualizada!");
      } else {
        await goalService.create(user.id, input);
        notify.success("Meta criada!", "Agora é só ir guardando aos poucos. 💪");
      }
      onClose();
    } catch (error) {
      notify.error(error, "Não foi possível salvar a meta.");
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      preventClose={isSubmitting}
      title={isEditing ? "Editar meta" : "Nova meta"}
      description="Defina um objetivo financeiro e acompanhe o quanto falta para alcançá-lo."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" form="goal-form" isLoading={isSubmitting} loadingText="Salvando...">
            {isEditing ? "Salvar alterações" : "Criar meta"}
          </Button>
        </>
      }
    >
      <form id="goal-form" onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4 sm:grid-cols-2">
        <Input
          id="goal-name"
          label="Nome da meta"
          required
          placeholder="Ex.: Reserva de emergência"
          leftIcon={<Target />}
          maxLength={40}
          containerClassName="sm:col-span-2"
          error={errors.name?.message}
          {...register("name")}
        />
        <Input
          id="goal-target"
          label="Quanto você quer juntar?"
          required
          inputMode="numeric"
          placeholder="R$ 0,00"
          leftIcon={<Wallet />}
          error={errors.targetAmount?.message}
          {...withMask(register("targetAmount"), maskCurrency)}
        />
        <Input
          id="goal-current"
          label="Quanto já tem guardado?"
          inputMode="numeric"
          placeholder="R$ 0,00"
          leftIcon={<PiggyBank />}
          hint="Deixe em branco se ainda não começou."
          error={errors.currentAmount?.message}
          {...withMask(register("currentAmount"), maskCurrency)}
        />
        <Input
          id="goal-deadline"
          type="date"
          label="Prazo"
          required
          leftIcon={<CalendarDays />}
          containerClassName="sm:col-span-2"
          error={errors.deadline?.message}
          {...register("deadline")}
        />
        <Textarea
          id="goal-description"
          label="Descrição"
          placeholder="Opcional — por que essa meta é importante para você?"
          rows={2}
          maxLength={120}
          containerClassName="sm:col-span-2"
          error={errors.description?.message}
          {...register("description")}
        />
        <div className="sm:col-span-2">
          <Controller
            control={control}
            name="color"
            render={({ field }) => (
              <ColorPicker value={field.value} onChange={field.onChange} error={errors.color?.message} />
            )}
          />
        </div>
      </form>
    </Modal>
  );
}
