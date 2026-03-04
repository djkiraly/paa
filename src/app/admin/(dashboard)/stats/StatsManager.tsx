"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminTable } from "@/components/admin/AdminTable";
import { EntityForm } from "@/components/admin/EntityForm";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { createStat, updateStat, deleteStat } from "@/lib/admin-actions";

type Stat = {
  id: number;
  label: string;
  value: string;
  numericValue: number | null;
  prefix: string | null;
  suffix: string | null;
  source: string | null;
  sourceUrl: string | null;
  year: number | null;
  category: string;
  orderIndex: number;
};

const fields = [
  { name: "label", label: "Label", required: true },
  { name: "value", label: "Display Value", required: true },
  { name: "numericValue", label: "Numeric Value", type: "number" as const },
  { name: "prefix", label: "Prefix" },
  { name: "suffix", label: "Suffix" },
  { name: "source", label: "Source" },
  { name: "sourceUrl", label: "Source URL" },
  { name: "year", label: "Year", type: "number" as const },
  { name: "category", label: "Category", required: true },
  { name: "orderIndex", label: "Order", type: "number" as const, required: true },
];

const columns = [
  { key: "label" as const, label: "Label" },
  { key: "value" as const, label: "Value" },
  { key: "category" as const, label: "Category" },
  { key: "orderIndex" as const, label: "Order" },
];

export function StatsManager({ initialData }: { initialData: Stat[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Stat | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Stat | null>(null);

  return (
    <>
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => setCreating(true)}
          className="rounded-lg bg-[var(--paa-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--paa-accent-light)]"
        >
          Add Stat
        </button>
      </div>

      <AdminTable
        columns={columns}
        data={initialData}
        onEdit={(row) => setEditing(row)}
        onDelete={(id) =>
          setDeleting(initialData.find((s) => s.id === id) ?? null)
        }
      />

      {creating && (
        <EntityForm
          title="Add Stat"
          fields={fields}
          onSubmit={async (fd) => {
            await createStat(fd);
            setCreating(false);
            router.refresh();
          }}
          onCancel={() => setCreating(false)}
        />
      )}

      {editing && (
        <EntityForm
          title="Edit Stat"
          fields={fields}
          initialData={editing as unknown as Record<string, unknown>}
          onSubmit={async (fd) => {
            await updateStat(fd);
            setEditing(null);
            router.refresh();
          }}
          onCancel={() => setEditing(null)}
        />
      )}

      {deleting && (
        <DeleteConfirmDialog
          label={deleting.label}
          onConfirm={async () => {
            await deleteStat(deleting.id);
            setDeleting(null);
            router.refresh();
          }}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  );
}
