"use client";

import { useId } from "react";
import { useLang } from "@/lib/i18n";
import { useDialogA11y } from "@/hooks/useDialogA11y";

export default function AlertModal({
  open,
  title,
  message,
  onClose,
}: {
  open: boolean;
  title?: string;
  message: string;
  onClose: () => void;
}) {
  const { t } = useLang();
  const titleId = useId();
  const messageId = useId();
  const dialogRef = useDialogA11y<HTMLDivElement>(open, onClose);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={messageId}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="w-full max-w-sm rounded-xl bg-surface p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <h3 id={titleId} className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
        )}
        <p id={messageId} className="mb-5 text-sm text-content-soft whitespace-pre-line">{message}</p>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            {t("확인", "Confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
