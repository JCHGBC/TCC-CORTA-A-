"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDownCircle, ArrowUpCircle, CalendarDays, FileText, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/feedback";
import { Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/misc";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PAYMENT_METHODS } from "@/config/constants";
import { todayISO } from "@/lib/formatters";
import { centsToMasked, maskCurrency, parseCurrency, withMask } from "@/lib/masks";
import { notify } from "@/lib/toast";
import { transactionSchema, type TransactionFormValues } from "@/lib/validations";
import { transactionService } from "@/services";
import type { PaymentMethod, Transaction, TransactionType } from "@/types";
import { useCategories } from "./hooks";

interface TransactionFormModalProps {
  open: boolean;
  onClose: () => void;
  defaultType?: TransactionType;
  transaction?: Transaction | null;
}

const FORM_ID = "transaction-form";

export function TransactionFormModal({ open, onClose, defaultType = "saida", transaction }: TransactionFormModalProps) {
  const isEditing = !!transaction;
  const [type, setType] = useState<TransactionType>(transaction?.type ?? defaultType);
  const [isSaving, setIsSaving] = useState(false);

  const typeLabel = type === "entrada" ? "entrada" : "saída";

  return (
    <Modal
      open={open}
      onClose={onClose}
      preventClose={isSaving}
      title={isEditing ? `Editar ${typeLabel}` : "Nova movimentação"}
      description={
        type === "entrada"
          ? "Registre um valor que você recebeu e defina a origem."
          : "Registre um valor que você gastou e defina a categoria."
      }
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form={FORM_ID}
            isLoading={isSaving}
            loadingText="Salvando..."
            variant={type === "entrada" ? "primary" : "danger"}
          >
            {isEditing ? "Salvar alterações" : `Registrar ${typeLabel}`}
          </Button>
        </>
      }
    >
      {!isEditing && (
        <SegmentedControl
          ariaLabel="Tipo de movimentação"
          className="mb-5 flex w-full"
          value={type}
          onChange={setType}
          options={[
            { value: "entrada", label: "Entrada", icon: <ArrowUpCircle className="text-income" /> },
            { value: "saida", label: "Saída", icon: <ArrowDownCircle className="text-expense" /> },
          ]}
        />
      )}
      {/* key: recria o formulário ao trocar de tipo, limpando a categoria */}
      <TransactionForm
        key={type}
        type={type}
        transaction={transaction}
        onSavingChange={setIsSaving}
        onSaved={onClose}
      />
    </Modal>
  );
}

interface TransactionFormProps {
  type: TransactionType;
  transaction?: Transaction | null;
  onSavingChange: (saving: boolean) => void;
  onSaved: () => void;
}

function TransactionForm({ type, transaction, onSavingChange, onSaved }: TransactionFormProps) {
  const categories = useCategories(type);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      description: transaction?.description ?? "",
      amount: transaction ? centsToMasked(transaction.amount) : "",
      categoryId: transaction?.categoryId ?? "",
      date: transaction?.date ?? todayISO(),
      paymentMethod: transaction?.paymentMethod ?? (type === "entrada" ? "pix" : "debito"),
      notes: transaction?.notes ?? "",
    },
  });

  async function onSubmit(values: TransactionFormValues) {
    onSavingChange(true);
    const input = {
      type,
      description: values.description,
      amount: parseCurrency(values.amount),
      categoryId: values.categoryId,
      date: values.date,
      paymentMethod: values.paymentMethod as PaymentMethod,
      notes: values.notes,
    };
    try {
      if (transaction) {
        await transactionService.update(transaction.id, input);
        notify.success("Movimentação atualizada com sucesso!");
      } else {
        await transactionService.create(input);
        notify.success(type === "entrada" ? "Entrada registrada!" : "Saída registrada!", "Seu saldo já foi atualizado.");
      }
      onSaved();
    } catch (error) {
      notify.error(error, "Não foi possível salvar a movimentação.");
    } finally {
      onSavingChange(false);
    }
  }

  if (categories.status === "loading") {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="size-7" />
      </div>
    );
  }

  const options = (categories.data ?? []).map((c) => ({ value: c.id, label: c.name }));

  return (
    <form id={FORM_ID} onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4 sm:grid-cols-2">
      <Input
        id="description"
        label="Descrição"
        required
        placeholder={type === "entrada" ? "Ex.: Salário de setembro" : "Ex.: Mercado"}
        leftIcon={<FileText />}
        maxLength={60}
        containerClassName="sm:col-span-2"
        error={errors.description?.message}
        {...register("description")}
      />
      <Input
        id="amount"
        label="Valor"
        required
        inputMode="numeric"
        placeholder="R$ 0,00"
        leftIcon={<Wallet />}
        error={errors.amount?.message}
        {...withMask(register("amount"), maskCurrency)}
      />
      <Input
        id="date"
        type="date"
        label="Data"
        required
        leftIcon={<CalendarDays />}
        error={errors.date?.message}
        {...register("date")}
      />
      <Select
        id="categoryId"
        label={type === "entrada" ? "Origem" : "Categoria"}
        required
        placeholder="Selecione..."
        options={options}
        error={errors.categoryId?.message}
        hint={
          options.length === 0 ? undefined : type === "entrada" ? "De onde veio o dinheiro?" : "Com o que você gastou?"
        }
        {...register("categoryId")}
      />
      <Select
        id="paymentMethod"
        label={type === "entrada" ? "Recebido via" : "Forma de pagamento"}
        required
        options={PAYMENT_METHODS}
        error={errors.paymentMethod?.message}
        {...register("paymentMethod")}
      />
      {options.length === 0 && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 sm:col-span-2">
          Você ainda não tem categorias de {type === "entrada" ? "entrada" : "saída"}.{" "}
          <Link href="/categorias" className="font-semibold underline">
            Criar categoria
          </Link>
        </p>
      )}
      <Textarea
        id="notes"
        label="Observação"
        placeholder="Opcional"
        rows={2}
        maxLength={200}
        containerClassName="sm:col-span-2"
        error={errors.notes?.message}
        {...register("notes")}
      />
    </form>
  );
}
