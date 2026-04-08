"use client";

import { useState, useTransition } from "react";
import { saveGeneralSettings } from "@/lib/admin-actions";

type Props = {
  initialValues: Record<string, string>;
};

export function GeneralSettingsForm({ initialValues }: Props) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await saveGeneralSettings(formData);
        setMessage("Settings saved");
        setMessageType("success");
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "Save failed");
        setMessageType("error");
      }
    });
  }

  const inputClassName =
    "w-full rounded-lg border border-white/10 bg-[var(--paa-midnight)] px-3 py-2 text-sm text-[var(--paa-white)] focus:border-[var(--paa-accent)] focus:outline-none";

  return (
    <div className="rounded-xl border border-white/10 bg-[var(--paa-navy)] p-6">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-[var(--paa-white)] font-[family-name:var(--font-barlow)]">
          General
        </h3>
        <p className="mt-1 text-sm text-[var(--paa-gray)]">
          Site identity used across public pages, metadata, and emails
        </p>
      </div>

      {message && (
        <div
          className={`mb-4 rounded-lg px-4 py-3 text-sm ${
            messageType === "success"
              ? "bg-green-500/10 border border-green-500/20 text-green-400"
              : "bg-red-500/10 border border-red-500/20 text-red-400"
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--paa-gray)] mb-1">
            Site Name
          </label>
          <input
            name="site_name"
            type="text"
            defaultValue={initialValues.site_name || ""}
            placeholder="Panhandle Aviation Alliance"
            className={inputClassName}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--paa-gray)] mb-1">
            Tagline
          </label>
          <input
            name="tagline"
            type="text"
            defaultValue={initialValues.tagline || ""}
            placeholder="Western Nebraska Aviation Advocacy"
            className={inputClassName}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--paa-gray)] mb-1">
            Contact Email
          </label>
          <input
            name="contact_email"
            type="email"
            defaultValue={initialValues.contact_email || ""}
            placeholder="info@panhandleaviationalliance.org"
            className={inputClassName}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--paa-gray)] mb-1">
            Location
          </label>
          <input
            name="location"
            type="text"
            defaultValue={initialValues.location || ""}
            placeholder="Scottsbluff, Nebraska"
            className={inputClassName}
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-[var(--paa-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--paa-accent-light)] disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
