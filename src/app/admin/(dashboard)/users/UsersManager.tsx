"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminTable } from "@/components/admin/AdminTable";
import { EntityForm } from "@/components/admin/EntityForm";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import {
  createUser,
  updateUser,
  resetUserPassword,
  deleteUser,
  resendActivationEmail,
} from "@/lib/admin-actions";

type User = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  activatedAt: Date | null;
  createdAt: Date;
};

const createFields = [
  { name: "name", label: "Name" },
  { name: "email", label: "Email", required: true },
  {
    name: "role",
    label: "Role",
    type: "select" as const,
    options: [
      { value: "admin", label: "Admin" },
    ],
  },
];

const editFields = [
  { name: "name", label: "Name" },
  { name: "email", label: "Email", required: true },
  {
    name: "role",
    label: "Role",
    type: "select" as const,
    options: [
      { value: "admin", label: "Admin" },
    ],
  },
];

const passwordFields = [
  { name: "password", label: "New Password (min 8 characters)", required: true },
];

const columns = [
  { key: "name" as const, label: "Name" },
  { key: "email" as const, label: "Email" },
  { key: "role" as const, label: "Role" },
  {
    key: "activatedAt" as const,
    label: "Status",
    render: (value: User[keyof User]) =>
      value ? "Active" : "Pending activation",
  },
  {
    key: "createdAt" as const,
    label: "Created",
    render: (value: User[keyof User]) =>
      new Date(value as Date).toLocaleDateString(),
  },
];

export function UsersManager({
  initialData,
  currentUserId,
}: {
  initialData: User[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [resettingPassword, setResettingPassword] = useState<User | null>(null);
  const [deleting, setDeleting] = useState<User | null>(null);
  const [resending, setResending] = useState<string | null>(null);

  return (
    <>
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => setCreating(true)}
          className="rounded-lg bg-[var(--paa-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--paa-accent-light)]"
        >
          Add User
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10 bg-[var(--paa-midnight)]">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className="px-4 py-3 font-medium text-[var(--paa-gray)]"
                >
                  {col.label}
                </th>
              ))}
              <th className="px-4 py-3 font-medium text-[var(--paa-gray)] text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {initialData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-4 py-8 text-center text-[var(--paa-gray)]"
                >
                  No users found
                </td>
              </tr>
            ) : (
              initialData.map((user) => (
                <tr
                  key={user.id}
                  className="bg-[var(--paa-navy)] hover:bg-[var(--paa-navy)]/80"
                >
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className="px-4 py-3 text-[var(--paa-white)]"
                    >
                      {col.render
                        ? col.render(user[col.key])
                        : String(user[col.key] ?? "")}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditing(user)}
                        className="rounded px-2 py-1 text-xs text-[var(--paa-accent-light)] hover:bg-[var(--paa-accent)]/10"
                      >
                        Edit
                      </button>
                      {user.activatedAt ? (
                        <button
                          onClick={() => setResettingPassword(user)}
                          className="rounded px-2 py-1 text-xs text-amber-400 hover:bg-amber-500/10"
                        >
                          Reset Password
                        </button>
                      ) : (
                        <button
                          disabled={resending === user.id}
                          onClick={async () => {
                            setResending(user.id);
                            try {
                              await resendActivationEmail(user.id);
                              router.refresh();
                            } catch (err) {
                              alert(err instanceof Error ? err.message : "Failed to resend");
                            } finally {
                              setResending(null);
                            }
                          }}
                          className="rounded px-2 py-1 text-xs text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-50"
                        >
                          {resending === user.id ? "Sending..." : "Resend Invite"}
                        </button>
                      )}
                      {user.id !== currentUserId && (
                        <button
                          onClick={() => setDeleting(user)}
                          className="rounded px-2 py-1 text-xs text-red-400 hover:bg-red-500/10"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {creating && (
        <EntityForm
          title="Add User"
          fields={createFields}
          onSubmit={async (fd) => {
            await createUser(fd);
            setCreating(false);
            router.refresh();
          }}
          onCancel={() => setCreating(false)}
        />
      )}

      {editing && (
        <EntityForm
          title="Edit User"
          fields={editFields}
          initialData={editing as unknown as Record<string, unknown>}
          onSubmit={async (fd) => {
            await updateUser(fd);
            setEditing(null);
            router.refresh();
          }}
          onCancel={() => setEditing(null)}
        />
      )}

      {resettingPassword && (
        <EntityForm
          title={`Reset Password — ${resettingPassword.email}`}
          fields={passwordFields}
          initialData={{ id: resettingPassword.id }}
          onSubmit={async (fd) => {
            await resetUserPassword(fd);
            setResettingPassword(null);
            router.refresh();
          }}
          onCancel={() => setResettingPassword(null)}
        />
      )}

      {deleting && (
        <DeleteConfirmDialog
          label={deleting.email}
          onConfirm={async () => {
            await deleteUser(deleting.id);
            setDeleting(null);
            router.refresh();
          }}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  );
}
