"use client";

import { useCallback, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDownCircle, ArrowUpCircle, Pencil, Plus, Tag, Tags, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ColorPicker } from "@/components/ui/color-picker";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/ui/feedback";
import { Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/misc";
import { Modal } from "@/components/ui/modal";
import { COLOR_OPTIONS } from "@/config/constants";
import { useCurrentUser } from "@/features/auth/auth-context";
import { useCategories } from "@/features/transactions/hooks";
import { useAsyncData } from "@/hooks/use-async-data";
import { notify } from "@/lib/toast";
import { categorySchema, type CategoryFormValues } from "@/lib/validations";
import { categoryService } from "@/services";
import type { Category, TransactionType } from "@/types";

/** Tela de categorias (origem das entradas e saídas). */
export function CategoriesView() {
  const user = useCurrentUser();
  const [type, setType] = useState<TransactionType>("saida");
  const categories = useCategories(type);
  const usageFetcher = useCallback(() => categoryService.usage(user.id), [user.id]);
  const usage = useAsyncData(usageFetcher);

  const [form, setForm] = useState<{ open: boolean; category?: Category; key: number }>({ open: false, key: 0 });
  const [toDelete, setToDelete] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openForm = (category?: Category) => setForm((current) => ({ open: true, category, key: current.key + 1 }));
  const closeForm = useCallback(() => setForm((current) => ({ ...current, open: false })), []);

  async function confirmDelete() {
    if (!toDelete) return;
    setIsDeleting(true);
    try {
      await categoryService.remove(user.id, toDelete.id);
      notify.success("Categoria excluída.");
      setToDelete(null);
    } catch (error) {
      notify.error(error);
      setToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Categorias"
        description="Organize a origem das suas entradas e o destino dos seus gastos."
        actions={
          <Button onClick={() => openForm()} leftIcon={<Plus className="size-4" />}>
            Nova categoria
          </Button>
        }
      />

      <Card className="mx-auto max-w-3xl">
        <div className="border-b border-slate-100 p-4">
          <SegmentedControl
            ariaLabel="Tipo de categoria"
            className="flex w-full sm:inline-flex sm:w-auto"
            value={type}
            onChange={setType}
            options={[
              { value: "saida", label: "Saídas", icon: <ArrowDownCircle className="text-expense" /> },
              { value: "entrada", label: "Entradas", icon: <ArrowUpCircle className="text-income" /> },
            ]}
          />
        </div>

        {categories.status === "loading" && <ListSkeleton rows={6} />}
        {categories.status === "error" && <ErrorState message={categories.error} onRetry={categories.retry} />}
        {categories.status === "success" && categories.data?.length === 0 && (
          <EmptyState
            icon={<Tags />}
            title="Nenhuma categoria cadastrada"
            description="Crie categorias para organizar suas movimentações."
            action={
              <Button size="sm" onClick={() => openForm()} leftIcon={<Plus className="size-4" />}>
                Criar categoria
              </Button>
            }
          />
        )}
        {categories.status === "success" && !!categories.data?.length && (
          <ul className="divide-y divide-slate-100">
            {categories.data.map((category) => {
              const count = usage.data?.[category.id] ?? 0;
              return (
                <li key={category.id} className="flex items-center gap-3 px-5 py-3.5">
                  <span
                    className="flex size-10 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${category.color}1a`, color: category.color }}
                    aria-hidden
                  >
                    <Tag className="size-4.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">{category.name}</p>
                    <p className="text-xs text-slate-500">
                      {count} {count === 1 ? "movimentação" : "movimentações"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openForm(category)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    aria-label={`Editar categoria ${category.name}`}
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setToDelete(category)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    aria-label={`Excluir categoria ${category.name}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {form.open && (
        <CategoryFormModal key={form.key} onClose={closeForm} category={form.category} defaultType={type} />
      )}
      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Excluir categoria?"
        description={
          toDelete
            ? `A categoria "${toDelete.name}" será excluída. Categorias com movimentações não podem ser excluídas.`
            : ""
        }
      />
    </div>
  );
}

interface CategoryFormModalProps {
  onClose: () => void;
  category?: Category;
  defaultType: TransactionType;
}

function CategoryFormModal({ onClose, category, defaultType }: CategoryFormModalProps) {
  const user = useCurrentUser();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name ?? "",
      type: category?.type ?? defaultType,
      color: category?.color ?? COLOR_OPTIONS[0],
    },
  });

  async function onSubmit(values: CategoryFormValues) {
    try {
      if (category) {
        await categoryService.update(user.id, category.id, values);
        notify.success("Categoria atualizada!");
      } else {
        await categoryService.create(user.id, values);
        notify.success("Categoria criada!");
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
      title={category ? "Editar categoria" : "Nova categoria"}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" form="category-form" isLoading={isSubmitting} loadingText="Salvando...">
            Salvar
          </Button>
        </>
      }
    >
      <form id="category-form" onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Input
          id="category-name"
          label="Nome"
          required
          placeholder="Ex.: Academia"
          maxLength={30}
          leftIcon={<Tag />}
          error={errors.name?.message}
          {...register("name")}
        />
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">Tipo</span>
              <SegmentedControl
                ariaLabel="Tipo"
                className="flex w-full"
                value={field.value}
                onChange={field.onChange}
                options={[
                  { value: "entrada", label: "Entrada" },
                  { value: "saida", label: "Saída" },
                ]}
              />
            </div>
          )}
        />
        <Controller
          control={control}
          name="color"
          render={({ field }) => <ColorPicker value={field.value} onChange={field.onChange} error={errors.color?.message} />}
        />
      </form>
    </Modal>
  );
}
