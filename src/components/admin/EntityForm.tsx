"use client";

import { useState, useTransition } from "react";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

type FieldDef = {
  name: string;
  label: string;
  type?: "text" | "number" | "textarea" | "select" | "image-upload";
  options?: { value: string; label: string }[];
  required?: boolean;
};

type EntityFormProps = {
  title: string;
  fields: FieldDef[];
  initialData?: Record<string, unknown>;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
  gcsConfigured?: boolean;
};

export function EntityForm({
  title,
  fields,
  initialData,
  onSubmit,
  onCancel,
  gcsConfigured = false,
}: EntityFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    if (initialData?.id) {
      formData.set("id", String(initialData.id));
    }
    startTransition(async () => {
      try {
        await onSubmit(formData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-lg rounded-xl border border-white/10 bg-[var(--paa-navy)] p-6">
        <h2 className="mb-4 text-lg font-bold text-[var(--paa-white)] font-[family-name:var(--font-barlow)]">
          {title}
        </h2>
        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-[var(--paa-gray)] mb-1">
                {field.label}
              </label>
              {field.type === "image-upload" ? (
                <ImageUploadField
                  name={field.name}
                  defaultValue={String(initialData?.[field.name] ?? "")}
                  gcsConfigured={gcsConfigured}
                />
              ) : field.type === "textarea" ? (
                <textarea
                  name={field.name}
                  required={field.required}
                  defaultValue={String(initialData?.[field.name] ?? "")}
                  rows={3}
                  className="w-full rounded-lg border border-white/10 bg-[var(--paa-midnight)] px-3 py-2 text-sm text-[var(--paa-white)] focus:border-[var(--paa-accent)] focus:outline-none"
                />
              ) : field.type === "select" ? (
                <select
                  name={field.name}
                  required={field.required}
                  defaultValue={String(initialData?.[field.name] ?? "")}
                  className="w-full rounded-lg border border-white/10 bg-[var(--paa-midnight)] px-3 py-2 text-sm text-[var(--paa-white)] focus:border-[var(--paa-accent)] focus:outline-none"
                >
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  name={field.name}
                  type={field.type ?? "text"}
                  required={field.required}
                  defaultValue={String(initialData?.[field.name] ?? "")}
                  className="w-full rounded-lg border border-white/10 bg-[var(--paa-midnight)] px-3 py-2 text-sm text-[var(--paa-white)] focus:border-[var(--paa-accent)] focus:outline-none"
                />
              )}
            </div>
          ))}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg px-4 py-2 text-sm text-[var(--paa-gray)] hover:text-[var(--paa-white)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-[var(--paa-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--paa-accent-light)] disabled:opacity-50"
            >
              {isPending ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
