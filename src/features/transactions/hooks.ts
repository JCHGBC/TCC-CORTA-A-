"use client";

import { useCallback } from "react";
import { useAsyncData } from "@/hooks/use-async-data";
import { categoryService, transactionService } from "@/services";
import type { TransactionFilters, TransactionType } from "@/types";

export function useTransactions(filters: TransactionFilters = {}) {
  const { type, month, categoryId, search } = filters;
  const fetcher = useCallback(
    () => transactionService.list({ type, month, categoryId, search }),
    [type, month, categoryId, search],
  );
  return useAsyncData(fetcher);
}

export function useCategories(type?: TransactionType) {
  const fetcher = useCallback(() => categoryService.list(type), [type]);
  return useAsyncData(fetcher);
}
