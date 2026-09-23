"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Minus, Plus, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProgressBar, SegmentedControl } from "@/components/ui/misc";
import { Modal } from "@/components/ui/modal";
import { goalProgress } from "@/lib/finance";
import { formatCurrency } from "@/lib/formatters";
import { maskCurrency, parseCurrency, withMask } from "@/lib/masks";
import { notify } from "@/lib/toast";
import { goalMovementSchema, type GoalMovementFormValues } from "@/lib/validations";
import { goalService } from "@/services";
import type { Goal } from "@/types";

interface GoalMovementModalProps {
  goal: Goal;
  onClose: () => void;
}

/** Guardar ou retirar dinheiro de uma meta. */
export function GoalMovementModal({ goal, onClose }: GoalMovementModalProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GoalMovementFormValues>({
    resolver: zodResolver(goalMovementSchema),
    defaultValues: { operation: "deposit", amount: "" },
  });

  const operation = useWatch({ control, name: "operation" });
  const amount = parseCurrency(useWatch({ control, name: "amount" }) ?? "");
  const preview = Math.max(0, goal.currentAmount + (operation === "deposit" ? amount : -amount));
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

  async function onSubmit(values: GoalMovementFormValues) {
    try {
      const updated = await goalService.move(goal.id, values.operation, parseCurrency(values.amount));
      if (updated.currentAmount >= updated.targetAmount && goal.currentAmount < goal.targetAmount) {
        notify.success("Parabéns! Meta alcançada! 🎉", `Você concluiu "${goal.name}".`);
      } else {
        notify.success(values.operation === "deposit" ? "Valor guardado na meta!" : "Valor retirado da meta.");
      }
      onClose();
    } catch (error) {
      notify.error(error);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      preventClose={isSubmitting}
      size="sm"
      title={goal.name}
      description={`Guardado: ${formatCurrency(goal.currentAmount)} de ${formatCurrency(goal.targetAmount)}`}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" form="goal-movement-form" isLoading={isSubmitting} loadingText="Salvando...">
            Confirmar
          </Button>
        </>
      }
    >
      <form id="goal-movement-form" onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Controller
          control={control}
          name="operation"
          render={({ field }) => (
            <SegmentedControl
              ariaLabel="Operação"
              className="flex w-full"
              value={field.value}
              onChange={field.onChange}
              options={[
                { value: "deposit", label: "Guardar", icon: <Plus /> },
                { value: "withdraw", label: "Retirar", icon: <Minus /> },
              ]}
            />
          )}
        />
        <Input
          id="goal-movement-amount"
          label="Valor"
          required
          inputMode="numeric"
          placeholder="R$ 0,00"
          leftIcon={<Wallet />}
          error={errors.amount?.message}
          hint={operation === "deposit" && remaining > 0 ? `Faltam ${formatCurrency(remaining)} para concluir.` : undefined}
          {...withMask(register("amount"), maskCurrency)}
        />
        <div className="rounded-xl bg-slate-50 p-4">
          <div className="mb-2 flex justify-between text-xs text-slate-500">
            <span>Depois desta operação</span>
            <span className="font-semibold text-slate-700">{formatCurrency(preview)}</span>
          </div>
          <ProgressBar value={goalProgress({ ...goal, currentAmount: preview })} color={goal.color} />
        </div>
      </form>
    </Modal>
  );
}
