import { useEffect } from "react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCancel();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div onClick={onCancel} aria-hidden="true" className="absolute inset-0 bg-black/50" />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        className="relative w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-lg"
      >
        <h3 id="confirm-dialog-title" className="text-lg font-semibold tracking-tight">
          {title}
        </h3>
        <p id="confirm-dialog-message" className="mt-2 text-sm text-muted">
          {message}
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onCancel}
            autoFocus
            className="rounded-full border border-border px-4 py-2 text-sm hover:bg-surface"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="rounded-full bg-danger px-4 py-2 text-sm font-medium text-background hover:opacity-80"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
