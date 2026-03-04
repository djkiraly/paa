"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { markContactRead, deleteContact } from "@/lib/admin-actions";

type Contact = {
  id: number;
  name: string;
  email: string;
  organization: string | null;
  message: string;
  type: string;
  read: boolean;
  createdAt: Date;
};

export function ContactsManager({ initialData }: { initialData: Contact[] }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<Contact | null>(null);

  async function handleMarkRead(id: number) {
    await markContactRead(id);
    router.refresh();
  }

  return (
    <>
      <div className="space-y-3">
        {initialData.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-[var(--paa-navy)] p-8 text-center text-[var(--paa-gray)]">
            No contact submissions yet
          </div>
        ) : (
          initialData.map((contact) => (
            <div
              key={contact.id}
              className={`rounded-xl border bg-[var(--paa-navy)] transition-colors ${
                contact.read
                  ? "border-white/10"
                  : "border-[var(--paa-accent)]/30"
              }`}
            >
              <button
                onClick={() =>
                  setExpanded(expanded === contact.id ? null : contact.id)
                }
                className="flex w-full items-center justify-between px-6 py-4 text-left"
              >
                <div className="flex items-center gap-4">
                  {!contact.read && (
                    <span className="h-2 w-2 rounded-full bg-[var(--paa-accent)]" />
                  )}
                  <div>
                    <span className="font-medium text-[var(--paa-white)]">
                      {contact.name}
                    </span>
                    <span className="ml-3 text-sm text-[var(--paa-gray)]">
                      {contact.email}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[var(--paa-gray)]">
                    {new Date(contact.createdAt).toLocaleDateString()}
                  </span>
                  <span className="rounded bg-white/5 px-2 py-0.5 text-xs text-[var(--paa-gray)]">
                    {contact.type}
                  </span>
                </div>
              </button>

              {expanded === contact.id && (
                <div className="border-t border-white/10 px-6 py-4">
                  {contact.organization && (
                    <p className="mb-2 text-sm text-[var(--paa-gray)]">
                      Organization: {contact.organization}
                    </p>
                  )}
                  <p className="whitespace-pre-wrap text-sm text-[var(--paa-white)]">
                    {contact.message}
                  </p>
                  <div className="mt-4 flex gap-3">
                    {!contact.read && (
                      <button
                        onClick={() => handleMarkRead(contact.id)}
                        className="rounded-lg bg-[var(--paa-accent)]/10 px-3 py-1.5 text-xs text-[var(--paa-accent-light)] hover:bg-[var(--paa-accent)]/20"
                      >
                        Mark as Read
                      </button>
                    )}
                    <button
                      onClick={() => setDeleting(contact)}
                      className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/20"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {deleting && (
        <DeleteConfirmDialog
          label={`message from ${deleting.name}`}
          onConfirm={async () => {
            await deleteContact(deleting.id);
            setDeleting(null);
            router.refresh();
          }}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  );
}
