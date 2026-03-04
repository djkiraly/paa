"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminTable } from "@/components/admin/AdminTable";
import { EntityForm } from "@/components/admin/EntityForm";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { createSection, updateSection, deleteSection } from "@/lib/admin-actions";

type Section = {
  id: number;
  pageSlug: string;
  sectionSlug: string;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  orderIndex: number;
};

const fields = [
  { name: "pageSlug", label: "Page Slug", required: true },
  { name: "sectionSlug", label: "Section Slug", required: true },
  { name: "title", label: "Title" },
  { name: "subtitle", label: "Subtitle" },
  { name: "content", label: "Content", type: "textarea" as const },
  { name: "orderIndex", label: "Order", type: "number" as const, required: true },
];

const columns = [
  { key: "pageSlug" as const, label: "Page" },
  { key: "sectionSlug" as const, label: "Section" },
  { key: "title" as const, label: "Title" },
  { key: "orderIndex" as const, label: "Order" },
];

export function SectionsManager({ initialData }: { initialData: Section[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Section | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Section | null>(null);

  return (
    <>
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => setCreating(true)}
          className="rounded-lg bg-[var(--paa-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--paa-accent-light)]"
        >
          Add Section
        </button>
      </div>

      <AdminTable
        columns={columns}
        data={initialData}
        onEdit={(row) => setEditing(row)}
        onDelete={(id) => setDeleting(initialData.find((s) => s.id === Number(id)) ?? null)}
      />

      {creating && (
        <EntityForm
          title="Add Section"
          fields={fields}
          onSubmit={async (fd) => {
            await createSection(fd);
            setCreating(false);
            router.refresh();
          }}
          onCancel={() => setCreating(false)}
        />
      )}

      {editing && (
        <EntityForm
          title="Edit Section"
          fields={fields}
          initialData={editing as unknown as Record<string, unknown>}
          onSubmit={async (fd) => {
            await updateSection(fd);
            setEditing(null);
            router.refresh();
          }}
          onCancel={() => setEditing(null)}
        />
      )}

      {deleting && (
        <DeleteConfirmDialog
          label={deleting.title ?? deleting.sectionSlug}
          onConfirm={async () => {
            await deleteSection(deleting.id);
            setDeleting(null);
            router.refresh();
          }}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  );
}
