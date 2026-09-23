import { CalendarClock, CircleCheck, Pencil, PiggyBank, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge, ProgressBar } from "@/components/ui/misc";
import { goalProgress, isGoalCompleted } from "@/lib/finance";
import { daysUntil, formatCurrency, formatDate } from "@/lib/formatters";
import type { Goal } from "@/types";

interface GoalCardProps {
  goal: Goal;
  onMove: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function deadlineInfo(goal: Goal) {
  if (isGoalCompleted(goal)) return { label: "Concluída", tone: "success" as const };
  const days = daysUntil(goal.deadline);
  if (days < 0) return { label: "Prazo vencido", tone: "danger" as const };
  if (days === 0) return { label: "Vence hoje", tone: "warning" as const };
  if (days <= 30) return { label: `${days} ${days === 1 ? "dia" : "dias"} restantes`, tone: "warning" as const };
  const months = Math.round(days / 30);
  return { label: `${months} ${months === 1 ? "mês" : "meses"} restantes`, tone: "info" as const };
}

/** Quanto guardar por mês para bater a meta no prazo. */
function monthlyNeeded(goal: Goal) {
  const remaining = goal.targetAmount - goal.currentAmount;
  const days = daysUntil(goal.deadline);
  if (remaining <= 0 || days <= 0) return null;
  const months = Math.max(1, Math.ceil(days / 30));
  return Math.ceil(remaining / months);
}

export function GoalCard({ goal, onMove, onEdit, onDelete }: GoalCardProps) {
  const progress = goalProgress(goal);
  const completed = isGoalCompleted(goal);
  const info = deadlineInfo(goal);
  const perMonth = monthlyNeeded(goal);

  return (
    <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="flex size-11 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${goal.color}1a`, color: goal.color }}
            aria-hidden
          >
            {completed ? <CircleCheck className="size-5.5" /> : <PiggyBank className="size-5.5" />}
          </span>
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-slate-900">{goal.name}</h3>
            <Badge tone={info.tone} className="mt-1">
              {info.label}
            </Badge>
          </div>
        </div>
        <div className="-mr-2 flex shrink-0">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label={`Editar meta ${goal.name}`}
          >
            <Pencil className="size-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
            aria-label={`Excluir meta ${goal.name}`}
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      {goal.description && <p className="mt-3 line-clamp-2 text-sm text-slate-500">{goal.description}</p>}

      <div className="mt-4 flex items-end justify-between gap-2">
        <div>
          <p className="text-xs text-slate-500">Guardado</p>
          <p className="text-xl font-bold text-slate-900">{formatCurrency(goal.currentAmount)}</p>
        </div>
        <p className="text-sm font-semibold" style={{ color: goal.color }}>
          {progress}%
        </p>
      </div>
      <ProgressBar value={progress} color={goal.color} className="mt-2" label={`Progresso da meta ${goal.name}`} />
      <div className="mt-2 flex justify-between text-xs text-slate-500">
        <span>Meta: {formatCurrency(goal.targetAmount)}</span>
        <span className="inline-flex items-center gap-1">
          <CalendarClock className="size-3.5" aria-hidden />
          {formatDate(goal.deadline)}
        </span>
      </div>

      <div className="mt-auto pt-4">
        {perMonth && (
          <p className="mb-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
            Guarde <strong className="text-slate-900">{formatCurrency(perMonth)}</strong> por mês para chegar lá no prazo.
          </p>
        )}
        <Button variant={completed ? "outline" : "secondary"} fullWidth size="sm" onClick={onMove}>
          {completed ? "Movimentar valor" : "Guardar dinheiro"}
        </Button>
      </div>
    </article>
  );
}
