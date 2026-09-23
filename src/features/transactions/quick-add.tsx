"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { Transaction, TransactionType } from "@/types";
import { TransactionFormModal } from "./transaction-form-modal";

interface OpenOptions {
  type?: TransactionType;
  transaction?: Transaction;
}

interface QuickAddContextValue {
  /** Abre o formulário de movimentação (nova ou edição) de qualquer tela. */
  open: (options?: OpenOptions) => void;
}

const QuickAddContext = createContext<QuickAddContextValue | null>(null);

export function QuickAddProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ open: boolean; key: number } & OpenOptions>({ open: false, key: 0 });

  const open = useCallback((options: OpenOptions = {}) => {
    setState((current) => ({ open: true, key: current.key + 1, ...options }));
  }, []);

  const close = useCallback(() => setState((current) => ({ ...current, open: false })), []);

  const value = useMemo(() => ({ open }), [open]);

  return (
    <QuickAddContext.Provider value={value}>
      {children}
      {state.open && (
        <TransactionFormModal
          key={state.key}
          open
          onClose={close}
          defaultType={state.type}
          transaction={state.transaction}
        />
      )}
    </QuickAddContext.Provider>
  );
}

export function useQuickAdd() {
  const context = useContext(QuickAddContext);
  if (!context) throw new Error("useQuickAdd deve ser usado dentro de <QuickAddProvider>.");
  return context;
}
