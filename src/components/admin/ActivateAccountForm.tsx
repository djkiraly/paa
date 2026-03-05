"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { activateAccount } from "@/lib/admin-actions";

export function ActivateAccountForm({
  token,
  userName,
  userEmail,
}: {
  token: string;
  userName: string | null;
  userEmail: string;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirm = formData.get("confirm") as string;

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    const result = await activateAccount(token, password);
    setLoading(false);

    if (!result.ok) {
      setError(result.error || "Activation failed");
    } else {
      router.push("/admin/login?activated=true");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--paa-midnight)]">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-[var(--paa-navy)] p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-[var(--paa-white)] font-[family-name:var(--font-barlow)]">
            Activate Your Account
          </h1>
          <p className="mt-2 text-sm text-[var(--paa-gray)]">
            Welcome{userName ? `, ${userName}` : ""}! Set your password to get started.
          </p>
          <p className="mt-1 text-xs text-[var(--paa-gray)]">{userEmail}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[var(--paa-gray)] mb-2"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full rounded-lg border border-white/10 bg-[var(--paa-midnight)] px-4 py-3 text-[var(--paa-white)] placeholder:text-[var(--paa-gray)]/50 focus:border-[var(--paa-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--paa-accent)]"
              placeholder="Min 8 characters"
            />
          </div>
          <div>
            <label
              htmlFor="confirm"
              className="block text-sm font-medium text-[var(--paa-gray)] mb-2"
            >
              Confirm Password
            </label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full rounded-lg border border-white/10 bg-[var(--paa-midnight)] px-4 py-3 text-[var(--paa-white)] placeholder:text-[var(--paa-gray)]/50 focus:border-[var(--paa-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--paa-accent)]"
              placeholder="Repeat your password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[var(--paa-accent)] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--paa-accent-light)] disabled:opacity-50"
          >
            {loading ? "Activating..." : "Set Password & Activate"}
          </button>
        </form>
      </div>
    </div>
  );
}
