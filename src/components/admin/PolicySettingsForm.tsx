"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { savePolicySettings } from "@/lib/admin-actions";
import { RichTextEditor } from "@/components/admin/RichTextEditor";

type Props = {
  initialValues: Record<string, string>;
};

export function PolicySettingsForm({ initialValues }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const privacyRef = useRef(initialValues.policy_privacy || "");
  const termsRef = useRef(initialValues.policy_terms || "");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    const formData = new FormData(e.currentTarget);
    formData.set("policy_privacy", privacyRef.current);
    formData.set("policy_terms", termsRef.current);
    startTransition(async () => {
      try {
        await savePolicySettings(formData);
        setMessage("Policies saved");
        setMessageType("success");
        router.refresh();
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "Save failed");
        setMessageType("error");
      }
    });
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[var(--paa-navy)] p-6 lg:col-span-2">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-[var(--paa-white)] font-[family-name:var(--font-barlow)]">
          Policies
        </h3>
        <p className="mt-1 text-sm text-[var(--paa-gray)]">
          Privacy Policy and Terms &amp; Conditions — displayed at /privacy and /terms
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-[var(--paa-gray)] mb-2">
            Privacy Policy
          </label>
          <RichTextEditor
            value={initialValues.policy_privacy || ""}
            onChange={(html) => { privacyRef.current = html; }}
            placeholder="Enter your privacy policy..."
            minHeight="200px"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--paa-gray)] mb-2">
            Terms &amp; Conditions
          </label>
          <RichTextEditor
            value={initialValues.policy_terms || ""}
            onChange={(html) => { termsRef.current = html; }}
            placeholder="Enter your terms and conditions..."
            minHeight="200px"
          />
        </div>

        <div className="border-t border-white/10 pt-4">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-[var(--paa-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--paa-accent-light)] disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save Policies"}
          </button>
        </div>
      </form>
    </div>
  );
}
