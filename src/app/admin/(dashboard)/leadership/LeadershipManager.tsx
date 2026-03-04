"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminTable } from "@/components/admin/AdminTable";
import { EntityForm } from "@/components/admin/EntityForm";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { createLeader, updateLeader, deleteLeader } from "@/lib/admin-actions";

type Leader = {
  id: number;
  name: string;
  title: string;
  organization: string | null;
  bio: string | null;
  imageUrl: string | null;
  orderIndex: number;
};

const fields = [
  { name: "name", label: "Name", required: true },
  { name: "title", label: "Title", required: true },
  { name: "organization", label: "Organization" },
  { name: "bio", label: "Bio", type: "textarea" as const },
  { name: "imageUrl", label: "Image", type: "image-upload" as const },
  { name: "orderIndex", label: "Order", type: "number" as const, required: true },
];

const columns = [
  { key: "name" as const, label: "Name" },
  { key: "title" as const, label: "Title" },
  { key: "organization" as const, label: "Organization" },
  { key: "orderIndex" as const, label: "Order" },
];

export function LeadershipManager({
  initialData,
  gcsConfigured = false,
}: {
  initialData: Leader[];
  gcsConfigured?: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<Leader | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Leader | null>(null);

  return (
    <>
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => setCreating(true)}
          className="rounded-lg bg-[var(--paa-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--paa-accent-light)]"
        >
          Add Leader
        </button>
      </div>

      <AdminTable
        columns={columns}
        data={initialData}
        onEdit={(row) => setEditing(row)}
        onDelete={(id) => setDeleting(initialData.find((l) => l.id === Number(id)) ?? null)}
      />

      {creating && (
        <EntityForm
          title="Add Leader"
          fields={fields}
          gcsConfigured={gcsConfigured}
          onSubmit={async (fd) => {
            await createLeader(fd);
            setCreating(false);
            router.refresh();
          }}
          onCancel={() => setCreating(false)}
        />
      )}

      {editing && (
        <EntityForm
          title="Edit Leader"
          fields={fields}
          initialData={editing as unknown as Record<string, unknown>}
          onSubmit={async (fd) => {
            await updateLeader(fd);
            setEditing(null);
            router.refresh();
          }}
          onCancel={() => setEditing(null)}
        />
      )}

      {deleting && (
        <DeleteConfirmDialog
          label={deleting.name}
          onConfirm={async () => {
            await deleteLeader(deleting.id);
            setDeleting(null);
            router.refresh();
          }}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  );
}
