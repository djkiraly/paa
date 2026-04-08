"use client";

import { useState } from "react";
import { verifyEmail } from "@/lib/admin-actions";

export function VerifyEmailButton({ token }: { token: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handleVerify() {
    setStatus("loading");
    const result = await verifyEmail(token);
    if (result.ok) {
      setStatus("success");
    } else {
      setError(result.error || "Verification failed");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div>
        <div className="mb-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-400">
          Email verified successfully!
        </div>
        <p className="text-sm text-[var(--paa-gray)] mb-6">
          An administrator will review your account. You&apos;ll receive an email
          when your account is approved.
        </p>
        <a
          href="/admin/login"
          className="inline-block rounded-lg bg-[var(--paa-accent)] px-6 py-2 text-sm font-semibold text-white hover:bg-[var(--paa-accent-light)]"
        >
          Go to Login
        </a>
      </div>
    );
  }

  return (
    <div>
      {status === "error" && (
        <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}
      <button
        onClick={handleVerify}
        disabled={status === "loading"}
        className="rounded-lg bg-[var(--paa-accent)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--paa-accent-light)] disabled:opacity-50"
      >
        {status === "loading" ? "Verifying..." : "Verify My Email"}
      </button>
    </div>
  );
}
