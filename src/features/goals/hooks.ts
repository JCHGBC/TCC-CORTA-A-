"use client";

import { useCallback } from "react";
import { useCurrentUser } from "@/features/auth/auth-context";
import { useAsyncData } from "@/hooks/use-async-data";
import { goalService } from "@/services";

export function useGoals() {
  const user = useCurrentUser();
  const fetcher = useCallback(() => goalService.list(user.id), [user.id]);
  return useAsyncData(fetcher);
}
