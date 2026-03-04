"use client";

import { useTransition } from "react";

export function DeleteConfirmDialog({
  onConfirm,
  onCancel,
  label,
}: {
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  label?: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-sm rounded-xl border border-white/10 bg-[var(--paa-navy)] p-6">
        <h2 className="mb-2 text-lg font-bold text-[var(--paa-white)]">
          Confirm Delete
        </h2>
        <p className="mb-6 text-sm text-[var(--paa-gray)]">
          Are you sure you want to delete{label ? ` "${label}"` : " this item"}?
          This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm text-[var(--paa-gray)] hover:text-[var(--paa-white)]"
          >
            Cancel
          </button>
          <button
            onClick={() => startTransition(() => onConfirm())}
            disabled={isPending}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
          >
            {isPending ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
