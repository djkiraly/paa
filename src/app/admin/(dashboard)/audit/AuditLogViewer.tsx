"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type AuditEntry = {
  id: string;
  userEmail: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  entityName: string | null;
  details: string | null;
  createdAt: Date;
};

const ACTION_STYLES: Record<string, string> = {
  CREATE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  UPDATE: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  DELETE: "bg-red-500/10 text-red-400 border-red-500/20",
  APPROVE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  REJECT: "bg-red-500/10 text-red-400 border-red-500/20",
  RESET_PASSWORD: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  MARK_READ: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  BULK_IMPORT: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

const ENTITY_TYPES = [
  { value: "", label: "All Types" },
  { value: "initiative", label: "Initiatives" },
  { value: "partner", label: "Partners" },
  { value: "section", label: "Sections" },
  { value: "user", label: "Users" },
  { value: "contact", label: "Contacts" },
  { value: "leadership", label: "Leadership" },
  { value: "tenant", label: "Tenants" },
];

const PAGE_SIZE = 50;

export function AuditLogViewer({
  entries,
  total,
  page,
  filter,
}: {
  entries: AuditEntry[];
  total: number;
  page: number;
  filter: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function navigate(newPage: number, newFilter?: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    if (newFilter !== undefined) params.set("type", newFilter);
    if (!params.get("type")) params.delete("type");
    if (params.get("page") === "1") params.delete("page");
    const qs = params.toString();
    router.push(`/admin/audit${qs ? `?${qs}` : ""}`);
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <>
      {/* Filter */}
      <div className="mb-6 flex items-center gap-4">
        <select
          value={filter}
          onChange={(e) => navigate(1, e.target.value)}
          className="rounded-lg border border-white/10 bg-[var(--paa-midnight)] px-3 py-2 text-sm text-[var(--paa-white)] focus:border-[var(--paa-accent)] focus:outline-none"
        >
          {ENTITY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <span className="text-sm text-[var(--paa-gray)]">
          {total} entr{total === 1 ? "y" : "ies"}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10 bg-[var(--paa-midnight)]">
            <tr>
              <th className="px-4 py-3 font-medium text-[var(--paa-gray)]">Timestamp</th>
              <th className="px-4 py-3 font-medium text-[var(--paa-gray)]">User</th>
              <th className="px-4 py-3 font-medium text-[var(--paa-gray)]">Action</th>
              <th className="px-4 py-3 font-medium text-[var(--paa-gray)]">Entity</th>
              <th className="px-4 py-3 font-medium text-[var(--paa-gray)]">Name / ID</th>
              <th className="px-4 py-3 font-medium text-[var(--paa-gray)]">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {entries.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[var(--paa-gray)]">
                  No audit log entries found
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry.id} className="bg-[var(--paa-navy)] hover:bg-[var(--paa-navy)]/80">
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-[var(--paa-gray)] font-[family-name:var(--font-jetbrains)]">
                    {new Date(entry.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-[var(--paa-white)]">
                    {entry.userEmail || "System"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                        ACTION_STYLES[entry.action] || "bg-white/5 text-[var(--paa-gray)] border-white/10"
                      }`}
                    >
                      {entry.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--paa-gray)] capitalize">
                    {entry.entityType}
                  </td>
                  <td className="px-4 py-3 text-[var(--paa-white)]">
                    {entry.entityName || entry.entityId || "—"}
                  </td>
                  <td className="px-4 py-3 text-[var(--paa-gray)] text-xs">
                    {entry.details || ""}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <button
            disabled={page <= 1}
            onClick={() => navigate(page - 1)}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-[var(--paa-gray)] hover:text-[var(--paa-white)] disabled:opacity-30"
          >
            Previous
          </button>
          <span className="text-sm text-[var(--paa-gray)]">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => navigate(page + 1)}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-[var(--paa-gray)] hover:text-[var(--paa-white)] disabled:opacity-30"
          >
            Next
          </button>
        </div>
      )}
    </>
  );
}
