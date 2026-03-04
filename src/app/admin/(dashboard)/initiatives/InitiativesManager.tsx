"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminTable } from "@/components/admin/AdminTable";
import { EntityForm } from "@/components/admin/EntityForm";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import {
  createInitiative,
  updateInitiative,
  deleteInitiative,
} from "@/lib/admin-actions";

type Initiative = {
  id: number;
  title: string;
  description: string;
  icon: string | null;
  status: string;
  category: string | null;
  orderIndex: number;
};

const fields = [
  { name: "title", label: "Title", required: true },
  { name: "description", label: "Description", type: "textarea" as const, required: true },
  { name: "icon", label: "Icon" },
  {
    name: "status",
    label: "Status",
    type: "select" as const,
    options: [
      { value: "active", label: "Active" },
      { value: "planned", label: "Planned" },
      { value: "completed", label: "Completed" },
    ],
  },
  { name: "category", label: "Category" },
  { name: "orderIndex", label: "Order", type: "number" as const, required: true },
];

const columns = [
  { key: "title" as const, label: "Title" },
  { key: "status" as const, label: "Status" },
  { key: "category" as const, label: "Category" },
  { key: "orderIndex" as const, label: "Order" },
];

export function InitiativesManager({ initialData }: { initialData: Initiative[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Initiative | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Initiative | null>(null);

  return (
    <>
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => setCreating(true)}
          className="rounded-lg bg-[var(--paa-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--paa-accent-light)]"
        >
          Add Initiative
        </button>
      </div>

      <AdminTable
        columns={columns}
        data={initialData}
        onEdit={(row) => setEditing(row)}
        onDelete={(id) => setDeleting(initialData.find((i) => i.id === Number(id)) ?? null)}
      />

      {creating && (
        <EntityForm
          title="Add Initiative"
          fields={fields}
          onSubmit={async (fd) => {
            await createInitiative(fd);
            setCreating(false);
            router.refresh();
          }}
          onCancel={() => setCreating(false)}
        />
      )}

      {editing && (
        <EntityForm
          title="Edit Initiative"
          fields={fields}
          initialData={editing as unknown as Record<string, unknown>}
          onSubmit={async (fd) => {
            await updateInitiative(fd);
            setEditing(null);
            router.refresh();
          }}
          onCancel={() => setEditing(null)}
        />
      )}

      {deleting && (
        <DeleteConfirmDialog
          label={deleting.title}
          onConfirm={async () => {
            await deleteInitiative(deleting.id);
            setDeleting(null);
            router.refresh();
          }}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  );
}
