"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminTable } from "@/components/admin/AdminTable";
import { EntityForm } from "@/components/admin/EntityForm";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { createPartner, updatePartner, deletePartner } from "@/lib/admin-actions";

type Partner = {
  id: number;
  name: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  tier: string;
  orderIndex: number;
};

const fields = [
  { name: "name", label: "Name", required: true },
  { name: "logoUrl", label: "Logo", type: "image-upload" as const },
  { name: "websiteUrl", label: "Website URL" },
  {
    name: "tier",
    label: "Tier",
    type: "select" as const,
    options: [
      { value: "champion", label: "Champion" },
      { value: "advocate", label: "Advocate" },
      { value: "supporter", label: "Supporter" },
    ],
  },
  { name: "orderIndex", label: "Order", type: "number" as const, required: true },
];

const columns = [
  { key: "name" as const, label: "Name" },
  { key: "tier" as const, label: "Tier" },
  { key: "websiteUrl" as const, label: "Website" },
  { key: "orderIndex" as const, label: "Order" },
];

export function PartnersManager({
  initialData,
  gcsConfigured = false,
}: {
  initialData: Partner[];
  gcsConfigured?: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<Partner | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Partner | null>(null);

  return (
    <>
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => setCreating(true)}
          className="rounded-lg bg-[var(--paa-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--paa-accent-light)]"
        >
          Add Partner
        </button>
      </div>

      <AdminTable
        columns={columns}
        data={initialData}
        onEdit={(row) => setEditing(row)}
        onDelete={(id) => setDeleting(initialData.find((p) => p.id === Number(id)) ?? null)}
      />

      {creating && (
        <EntityForm
          title="Add Partner"
          fields={fields}
          gcsConfigured={gcsConfigured}
          onSubmit={async (fd) => {
            await createPartner(fd);
            setCreating(false);
            router.refresh();
          }}
          onCancel={() => setCreating(false)}
        />
      )}

      {editing && (
        <EntityForm
          title="Edit Partner"
          fields={fields}
          initialData={editing as unknown as Record<string, unknown>}
          onSubmit={async (fd) => {
            await updatePartner(fd);
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
            await deletePartner(deleting.id);
            setDeleting(null);
            router.refresh();
          }}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  );
}
