"use client";

import { useAsyncData } from "@/hooks/use-async-data";
import { goalService } from "@/services";

const fetchGoals = () => goalService.list();

export function useGoals() {
  return useAsyncData(fetchGoals);
}
