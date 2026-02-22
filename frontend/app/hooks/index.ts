import { useState, useCallback } from "react";
import type { Toast } from "../types";

let _id = 0;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback(
    (message: string, type: Toast["type"] = "success") => {
      const id = ++_id;
      setToasts((t) => [...t, { id, message, type }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
    },
    [],
  );

  return { toasts, push };
}

export function usePagination(total: number, pageSize: number) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(total / pageSize);

  const goTo = useCallback(
    (p: number) => {
      setPage(Math.max(1, Math.min(p, totalPages)));
    },
    [totalPages],
  );

  const next = useCallback(() => goTo(page + 1), [page, goTo]);
  const prev = useCallback(() => goTo(page - 1), [page, goTo]);
  const reset = useCallback(() => setPage(1), []);

  return {
    page,
    totalPages,
    goTo,
    next,
    prev,
    reset,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
