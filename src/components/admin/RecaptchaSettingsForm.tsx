"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveRecaptchaSettings } from "@/lib/admin-actions";

type Props = {
  initialValues: Record<string, string>;
};

export function RecaptchaSettingsForm({ initialValues }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [enabled, setEnabled] = useState(initialValues.recaptcha_enabled === "true");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    const formData = new FormData(e.currentTarget);
    formData.set("recaptcha_enabled", enabled ? "true" : "");
    startTransition(async () => {
      try {
        await saveRecaptchaSettings(formData);
        setMessage("reCAPTCHA settings saved");
        setMessageType("success");
        router.refresh();
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
          reCAPTCHA v3
        </h3>
        <p className="mt-1 text-sm text-[var(--paa-gray)]">
          Bot protection for login, registration, and contact forms
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
        <div className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => setEnabled(!enabled)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
              enabled ? "bg-[var(--paa-accent)]" : "bg-white/10"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform ${
                enabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
          <span className="text-sm text-[var(--paa-white)]">
            {enabled ? "Enabled" : "Disabled"}
          </span>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--paa-gray)] mb-1">
            Site Key
          </label>
          <input
            name="recaptcha_site_key"
            type="text"
            defaultValue={initialValues.recaptcha_site_key || ""}
            placeholder="6Lc..."
            className={inputClassName}
          />
          <p className="mt-1 text-xs text-[var(--paa-gray)]/60">
            Public key from the Google reCAPTCHA admin console
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--paa-gray)] mb-1">
            Secret Key
          </label>
          <input
            name="recaptcha_secret_key"
            type="password"
            defaultValue={initialValues.recaptcha_secret_key || ""}
            placeholder="6Lc..."
            className={inputClassName}
          />
          <p className="mt-1 text-xs text-[var(--paa-gray)]/60">
            Server-side secret key — never exposed to the browser
          </p>
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
