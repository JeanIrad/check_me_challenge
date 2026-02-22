"use client";
import type { Toast } from "../../types";

export default function Toasts({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="toast-region" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.type === "success" && "✓ "}
          {t.type === "error" && "✕ "}
          {t.type === "info" && "○ "}
          {t.message}
        </div>
      ))}
    </div>
  );
}
