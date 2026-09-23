"use client";

import { useCallback, useMemo, useState } from "react";
import { CircleCheck, PiggyBank, Plus, Target } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/feedback";
import { SegmentedControl } from "@/components/ui/misc";
import { useCurrentUser } from "@/features/auth/auth-context";
import { isGoalCompleted } from "@/lib/finance";
import { formatCurrency } from "@/lib/formatters";
import { notify } from "@/lib/toast";
import { goalService } from "@/services";
import type { Goal } from "@/types";
import { GoalCard } from "./goal-card";
import { GoalFormModal } from "./goal-form-modal";
import { GoalMovementModal } from "./goal-movement-modal";
import { useGoals } from "./hooks";

type Filter = "andamento" | "concluidas" | "todas";

/** Tela de Metas (RF-05). */
export function GoalsView() {
  const user = useCurrentUser();
  const goals = useGoals();
  const [filter, setFilter] = useState<Filter>("andamento");
  const [form, setForm] = useState<{ open: boolean; goal?: Goal; key: number }>({ open: false, key: 0 });
  const [moving, setMoving] = useState<Goal | null>(null);
  const [toDelete, setToDelete] = useState<Goal | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openForm = (goal?: Goal) => setForm((current) => ({ open: true, goal, key: current.key + 1 }));
  const closeForm = useCallback(() => setForm((current) => ({ ...current, open: false })), []);

  const summary = useMemo(() => {
    const list = goals.data ?? [];
    return {
      saved: list.reduce((sum, g) => sum + g.currentAmount, 0),
      target: list.reduce((sum, g) => sum + g.targetAmount, 0),
      completed: list.filter(isGoalCompleted).length,
      total: list.length,
    };
  }, [goals.data]);

  const visible = (goals.data ?? []).filter((goal) =>
    filter === "todas" ? true : filter === "concluidas" ? isGoalCompleted(goal) : !isGoalCompleted(goal),
  );

  async function confirmDelete() {
    if (!toDelete) return;
    setIsDeleting(true);
    try {
      await goalService.remove(user.id, toDelete.id);
      notify.success("Meta excluída.");
      setToDelete(null);
    } catch (error) {
      notify.error(error);
    } finally {
      setIsDeleting(false);
    }
  }

  const isLoading = goals.status === "loading";

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Metas"
        description="Planeje suas economias e acompanhe cada objetivo financeiro."
        actions={
          <Button onClick={() => openForm()} leftIcon={<Plus className="size-4" />}>
            Nova meta
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total guardado"
          value={formatCurrency(summary.saved)}
          icon={<PiggyBank />}
          highlight
          helper={summary.target ? `de ${formatCurrency(summary.target)} planejados` : undefined}
          isLoading={isLoading}
        />
        <StatCard label="Metas criadas" value={String(summary.total)} icon={<Target />} tone="goal" isLoading={isLoading} />
        <StatCard label="Metas concluídas" value={String(summary.completed)} icon={<CircleCheck />} tone="income" isLoading={isLoading} />
      </div>

      <SegmentedControl
        ariaLabel="Filtrar metas"
        className="mb-5"
        value={filter}
        onChange={setFilter}
        options={[
          { value: "andamento", label: "Em andamento" },
          { value: "concluidas", label: "Concluídas" },
          { value: "todas", label: "Todas" },
        ]}
      />

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Carregando metas">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="space-y-4 p-5">
              <div className="flex items-center gap-3">
                <Skeleton className="size-11 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
              <Skeleton className="h-7 w-2/5" />
              <Skeleton className="h-2.5 w-full" />
              <Skeleton className="h-9 w-full" />
            </Card>
          ))}
        </div>
      )}

      {goals.status === "error" && (
        <Card>
          <ErrorState message={goals.error} onRetry={goals.retry} />
        </Card>
      )}

      {goals.status === "success" && visible.length === 0 && (
        <Card>
          <EmptyState
            icon={<Target />}
            title={
              summary.total === 0
                ? "Você ainda não tem metas"
                : filter === "concluidas"
                  ? "Nenhuma meta concluída ainda"
                  : "Nenhuma meta em andamento"
            }
            description={
              summary.total === 0
                ? "Crie sua primeira meta: uma viagem, uma reserva de emergência, um curso..."
                : "Continue guardando — você está no caminho certo!"
            }
            action={
              <Button size="sm" onClick={() => openForm()} leftIcon={<Plus className="size-4" />}>
                Criar meta
              </Button>
            }
          />
        </Card>
      )}

      {goals.status === "success" && visible.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onMove={() => setMoving(goal)}
              onEdit={() => openForm(goal)}
              onDelete={() => setToDelete(goal)}
            />
          ))}
        </div>
      )}

      {form.open && <GoalFormModal key={form.key} open onClose={closeForm} goal={form.goal} />}
      {moving && <GoalMovementModal goal={moving} onClose={() => setMoving(null)} />}
      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Excluir meta?"
        description={toDelete ? `A meta "${toDelete.name}" será excluída permanentemente.` : ""}
      />
    </div>
  );
}
