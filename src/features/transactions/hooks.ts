"use client";

import { useCallback } from "react";
import { useAsyncData } from "@/hooks/use-async-data";
import { useCurrentUser } from "@/features/auth/auth-context";
import { categoryService, transactionService } from "@/services";
import type { TransactionFilters, TransactionType } from "@/types";

export function useTransactions(filters: TransactionFilters = {}) {
  const user = useCurrentUser();
  const { type, month, categoryId, search } = filters;
  const fetcher = useCallback(
    () => transactionService.list(user.id, { type, month, categoryId, search }),
    [user.id, type, month, categoryId, search],
  );
  return useAsyncData(fetcher);
}

export function useCategories(type?: TransactionType) {
  const user = useCurrentUser();
  const fetcher = useCallback(() => categoryService.list(user.id, type), [user.id, type]);
  return useAsyncData(fetcher);
}
