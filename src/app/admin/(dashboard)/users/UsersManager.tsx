"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EntityForm } from "@/components/admin/EntityForm";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import {
  createUser,
  updateUser,
  resetUserPassword,
  deleteUser,
  resendActivationEmail,
  approveUser,
  rejectUser,
} from "@/lib/admin-actions";

type User = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  hasPassword: boolean;
  emailVerified: Date | null;
  activatedAt: Date | null;
  createdAt: Date;
};

type UserStatus = "Active" | "Pending Approval" | "Pending Verification" | "Pending Activation";

function getUserStatus(user: User): UserStatus {
  if (user.activatedAt) return "Active";
  if (user.emailVerified) return "Pending Approval";
  if (user.hasPassword) return "Pending Verification";
  return "Pending Activation";
}

function StatusBadge({ status }: { status: UserStatus }) {
  const styles: Record<UserStatus, string> = {
    Active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    "Pending Approval": "bg-amber-500/10 text-amber-400 border-amber-500/20",
    "Pending Verification": "bg-blue-500/10 text-blue-400 border-blue-500/20",
    "Pending Activation": "bg-gray-500/10 text-gray-400 border-gray-500/20",
  };
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}

const createFields = [
  { name: "name", label: "Name" },
  { name: "email", label: "Email", required: true },
  {
    name: "role",
    label: "Role",
    type: "select" as const,
    options: [{ value: "admin", label: "Admin" }],
  },
];

const editFields = [
  { name: "name", label: "Name" },
  { name: "email", label: "Email", required: true },
  {
    name: "role",
    label: "Role",
    type: "select" as const,
    options: [{ value: "admin", label: "Admin" }],
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
  const [rejecting, setRejecting] = useState<User | null>(null);
  const [resending, setResending] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  async function handleApprove(user: User) {
    setApprovingId(user.id);
    try {
      await approveUser(user.id);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to approve");
    } finally {
      setApprovingId(null);
    }
  }

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
              <th className="px-4 py-3 font-medium text-[var(--paa-gray)]">
                Status
              </th>
              <th className="px-4 py-3 font-medium text-[var(--paa-gray)] text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {initialData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 2}
                  className="px-4 py-8 text-center text-[var(--paa-gray)]"
                >
                  No users found
                </td>
              </tr>
            ) : (
              initialData.map((user) => {
                const status = getUserStatus(user);
                return (
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
                    <td className="px-4 py-3">
                      <StatusBadge status={status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditing(user)}
                          className="rounded px-2 py-1 text-xs text-[var(--paa-accent-light)] hover:bg-[var(--paa-accent)]/10"
                        >
                          Edit
                        </button>
                        {status === "Active" && (
                          <button
                            onClick={() => setResettingPassword(user)}
                            className="rounded px-2 py-1 text-xs text-amber-400 hover:bg-amber-500/10"
                          >
                            Reset Password
                          </button>
                        )}
                        {status === "Pending Activation" && (
                          <button
                            disabled={resending === user.id}
                            onClick={async () => {
                              setResending(user.id);
                              try {
                                await resendActivationEmail(user.id);
                                router.refresh();
                              } catch (err) {
                                alert(
                                  err instanceof Error
                                    ? err.message
                                    : "Failed to resend"
                                );
                              } finally {
                                setResending(null);
                              }
                            }}
                            className="rounded px-2 py-1 text-xs text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-50"
                          >
                            {resending === user.id
                              ? "Sending..."
                              : "Resend Invite"}
                          </button>
                        )}
                        {status === "Pending Approval" && (
                          <>
                            <button
                              disabled={approvingId === user.id}
                              onClick={() => handleApprove(user)}
                              className="rounded px-2 py-1 text-xs text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-50"
                            >
                              {approvingId === user.id
                                ? "Approving..."
                                : "Approve"}
                            </button>
                            <button
                              onClick={() => setRejecting(user)}
                              className="rounded px-2 py-1 text-xs text-red-400 hover:bg-red-500/10"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {user.id !== currentUserId && status !== "Pending Approval" && (
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
                );
              })
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

      {rejecting && (
        <DeleteConfirmDialog
          label={`Reject ${rejecting.email}? This will permanently remove their registration.`}
          onConfirm={async () => {
            await rejectUser(rejecting.id);
            setRejecting(null);
            router.refresh();
          }}
          onCancel={() => setRejecting(null)}
        />
      )}
    </>
  );
}
