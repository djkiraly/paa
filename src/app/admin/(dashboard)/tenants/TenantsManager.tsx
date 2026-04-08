"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminTable } from "@/components/admin/AdminTable";
import { EntityForm } from "@/components/admin/EntityForm";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import {
  createTenant,
  updateTenant,
  deleteTenant,
  bulkImportTenants,
} from "@/lib/admin-actions";

type Tenant = {
  id: number;
  name: string;
  hangarLocation: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  orderIndex: number;
};

const fields = [
  { name: "name", label: "Name", required: true },
  { name: "hangarLocation", label: "Hangar Location" },
  { name: "address", label: "Address" },
  { name: "phone", label: "Phone" },
  { name: "email", label: "Email" },
  { name: "orderIndex", label: "Order", type: "number" as const },
];

const columns = [
  { key: "name" as const, label: "Name" },
  { key: "hangarLocation" as const, label: "Hangar Location" },
  { key: "phone" as const, label: "Phone" },
  { key: "email" as const, label: "Email" },
];

const HEADER_NAMES = ["name", "hangar location", "address", "phone", "email"];

type ParsedRow = {
  name: string;
  hangarLocation?: string;
  address?: string;
  phone?: string;
  email?: string;
};

function parseTabDelimited(text: string): ParsedRow[] {
  const lines = text.split("\n").filter((l) => l.trim());
  if (lines.length === 0) return [];

  let startIdx = 0;
  // Auto-detect header row
  const firstCols = lines[0].split("\t").map((c) => c.trim().toLowerCase());
  if (firstCols.some((c) => HEADER_NAMES.includes(c))) {
    startIdx = 1;
  }

  return lines.slice(startIdx).map((line) => {
    const cols = line.split("\t").map((c) => c.trim());
    return {
      name: cols[0] || "",
      hangarLocation: cols[1] || undefined,
      address: cols[2] || undefined,
      phone: cols[3] || undefined,
      email: cols[4] || undefined,
    };
  }).filter((r) => r.name);
}

export function TenantsManager({ initialData }: { initialData: Tenant[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Tenant | null>(null);
  const [deleting, setDeleting] = useState<Tenant | null>(null);
  const [importing, setImporting] = useState(false);
  const [importText, setImportText] = useState("");
  const [importPreview, setImportPreview] = useState<ParsedRow[]>([]);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<{ ok: boolean; message: string } | null>(null);

  function handleParsePreview(text: string) {
    setImportText(text);
    setImportResult(null);
    setImportPreview(parseTabDelimited(text));
  }

  async function handleImport() {
    if (importPreview.length === 0) return;
    setImportLoading(true);
    setImportResult(null);
    try {
      const result = await bulkImportTenants(importPreview);
      setImportResult({ ok: true, message: `Imported ${result.count} tenant${result.count !== 1 ? "s" : ""} successfully` });
      setImportText("");
      setImportPreview([]);
      router.refresh();
    } catch (err) {
      setImportResult({ ok: false, message: err instanceof Error ? err.message : "Import failed" });
    } finally {
      setImportLoading(false);
    }
  }

  return (
    <>
      <div className="mb-6 flex justify-end gap-3">
        <button
          onClick={() => { setImporting(true); setImportText(""); setImportPreview([]); setImportResult(null); }}
          className="rounded-lg border border-white/10 px-4 py-2 text-sm text-[var(--paa-gray)] hover:text-[var(--paa-white)] hover:border-white/20"
        >
          Bulk Import
        </button>
        <button
          onClick={() => setCreating(true)}
          className="rounded-lg bg-[var(--paa-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--paa-accent-light)]"
        >
          Add Tenant
        </button>
      </div>

      <AdminTable
        columns={columns}
        data={initialData}
        onEdit={(row) => setEditing(row)}
        onDelete={(id) =>
          setDeleting(initialData.find((t) => t.id === Number(id)) ?? null)
        }
      />

      {creating && (
        <EntityForm
          title="Add Tenant"
          fields={fields}
          onSubmit={async (fd) => {
            await createTenant(fd);
            setCreating(false);
            router.refresh();
          }}
          onCancel={() => setCreating(false)}
        />
      )}

      {editing && (
        <EntityForm
          title="Edit Tenant"
          fields={fields}
          initialData={editing as unknown as Record<string, unknown>}
          onSubmit={async (fd) => {
            await updateTenant(fd);
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
            await deleteTenant(deleting.id);
            setDeleting(null);
            router.refresh();
          }}
          onCancel={() => setDeleting(null)}
        />
      )}

      {/* Bulk Import Modal */}
      {importing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-3xl rounded-xl border border-white/10 bg-[var(--paa-navy)] p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="mb-2 text-lg font-semibold text-[var(--paa-white)] font-[family-name:var(--font-barlow)]">
              Bulk Import Tenants
            </h3>
            <p className="mb-4 text-sm text-[var(--paa-gray)]">
              Paste tab-delimited data below. Columns:{" "}
              <span className="text-[var(--paa-white)]">
                Name, Hangar Location, Address, Phone, Email
              </span>{" "}
              (one row per tenant). Header rows are auto-detected and skipped.
            </p>

            {importResult && (
              <div
                className={`mb-4 rounded-lg px-4 py-3 text-sm ${
                  importResult.ok
                    ? "bg-green-500/10 border border-green-500/20 text-green-400"
                    : "bg-red-500/10 border border-red-500/20 text-red-400"
                }`}
              >
                {importResult.message}
              </div>
            )}

            <textarea
              value={importText}
              onChange={(e) => handleParsePreview(e.target.value)}
              rows={8}
              placeholder={"Name\tHangar Location\tAddress\tPhone\tEmail\nAcme Aviation\tHangar 1\t123 Airport Rd\t308-555-0100\tacme@example.com"}
              className="w-full rounded-lg border border-white/10 bg-[var(--paa-midnight)] px-3 py-2 text-sm text-[var(--paa-white)] font-[family-name:var(--font-jetbrains)] placeholder:text-[var(--paa-gray)]/40 focus:border-[var(--paa-accent)] focus:outline-none"
            />

            {importPreview.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-sm text-[var(--paa-gray)]">
                  Preview: {importPreview.length} row{importPreview.length !== 1 ? "s" : ""} detected
                </p>
                <div className="overflow-x-auto rounded-lg border border-white/10">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-white/10 bg-[var(--paa-midnight)]">
                      <tr>
                        <th className="px-3 py-2 text-[var(--paa-gray)]">Name</th>
                        <th className="px-3 py-2 text-[var(--paa-gray)]">Hangar</th>
                        <th className="px-3 py-2 text-[var(--paa-gray)]">Address</th>
                        <th className="px-3 py-2 text-[var(--paa-gray)]">Phone</th>
                        <th className="px-3 py-2 text-[var(--paa-gray)]">Email</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {importPreview.slice(0, 20).map((row, i) => (
                        <tr key={i} className="bg-[var(--paa-navy)]">
                          <td className="px-3 py-1.5 text-[var(--paa-white)]">{row.name}</td>
                          <td className="px-3 py-1.5 text-[var(--paa-white)]">{row.hangarLocation || ""}</td>
                          <td className="px-3 py-1.5 text-[var(--paa-white)]">{row.address || ""}</td>
                          <td className="px-3 py-1.5 text-[var(--paa-white)]">{row.phone || ""}</td>
                          <td className="px-3 py-1.5 text-[var(--paa-white)]">{row.email || ""}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {importPreview.length > 20 && (
                    <p className="px-3 py-2 text-xs text-[var(--paa-gray)]">
                      ...and {importPreview.length - 20} more rows
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setImporting(false)}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm text-[var(--paa-gray)] hover:text-[var(--paa-white)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImport}
                disabled={importPreview.length === 0 || importLoading}
                className="rounded-lg bg-[var(--paa-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--paa-accent-light)] disabled:opacity-50"
              >
                {importLoading
                  ? "Importing..."
                  : `Import ${importPreview.length} Tenant${importPreview.length !== 1 ? "s" : ""}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
