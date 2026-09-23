import { toast } from "sonner";
import { getErrorMessage } from "./utils";

/** Mensagens de feedback padronizadas (toasts). */
export const notify = {
  success: (message: string, description?: string) => toast.success(message, { description }),
  error: (error: unknown, fallback?: string) => toast.error(getErrorMessage(error, fallback)),
  info: (message: string, description?: string) => toast.info(message, { description }),
  warning: (message: string, description?: string) => toast.warning(message, { description }),
};
