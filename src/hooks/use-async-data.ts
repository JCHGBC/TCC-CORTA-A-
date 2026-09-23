"use client";

import { useCallback, useEffect, useState } from "react";
import { DATA_CHANGED_EVENT } from "@/services";
import { getErrorMessage } from "@/lib/utils";
import type { AsyncStatus } from "@/types";

interface State<T> {
  source: (() => Promise<T>) | null;
  data: T | undefined;
  error: string | null;
}

/**
 * Busca dados de forma assíncrona e controla os estados visuais
 * (carregando, erro, sucesso). Sempre que qualquer dado do sistema muda,
 * a consulta é refeita automaticamente (RNF-06).
 *
 * IMPORTANTE: o `fetcher` deve ser memorizado com useCallback.
 */
export function useAsyncData<T>(fetcher: () => Promise<T>) {
  const [state, setState] = useState<State<T>>({ source: null, data: undefined, error: null });
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let active = true;
    fetcher().then(
      (data) => active && setState({ source: fetcher, data, error: null }),
      (error) => active && setState({ source: fetcher, data: undefined, error: getErrorMessage(error) }),
    );
    return () => {
      active = false;
    };
  }, [fetcher, reloadToken]);

  // Atualização automática: depois de qualquer alteração e ao voltar para a aba
  // (os dados podem ter mudado em outro dispositivo)
  useEffect(() => {
    const refresh = () => setReloadToken((token) => token + 1);
    window.addEventListener(DATA_CHANGED_EVENT, refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener(DATA_CHANGED_EVENT, refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  /** Tenta novamente exibindo o estado de carregamento (usado no botão "Tentar novamente"). */
  const retry = useCallback(() => {
    setState((current) => ({ ...current, source: null }));
    setReloadToken((token) => token + 1);
  }, []);

  const status: AsyncStatus = state.source !== fetcher ? "loading" : state.error ? "error" : "success";

  return { data: state.data, error: state.error, status, retry };
}
