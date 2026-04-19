"use client";

import { useEffect } from "react";

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
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
        )}
        <p className="mb-5 text-sm text-gray-700 whitespace-pre-line">{message}</p>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
