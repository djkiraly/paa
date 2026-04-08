"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerAccount } from "@/lib/admin-actions";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    const result = await registerAccount(formData);
    setLoading(false);

    if (!result.ok) {
      setError(result.error || "Registration failed");
    } else {
      router.push("/admin/register?registered=true");
    }
  }

  const inputClassName =
    "w-full rounded-lg border border-white/10 bg-[var(--paa-midnight)] px-4 py-3 text-[var(--paa-white)] placeholder:text-[var(--paa-gray)]/50 focus:border-[var(--paa-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--paa-accent)]";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-[var(--paa-gray)] mb-2"
        >
          Name <span className="text-[var(--paa-gray)]/50">(optional)</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          className={inputClassName}
          placeholder="Your full name"
        />
      </div>
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-[var(--paa-gray)] mb-2"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputClassName}
          placeholder="you@example.com"
        />
      </div>
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
          className={inputClassName}
          placeholder="Min 8 characters"
        />
      </div>
      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-[var(--paa-gray)] mb-2"
        >
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={inputClassName}
          placeholder="Repeat your password"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-[var(--paa-accent)] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--paa-accent-light)] disabled:opacity-50"
      >
        {loading ? "Registering..." : "Register"}
      </button>
      <p className="text-center text-sm text-[var(--paa-gray)]">
        Already have an account?{" "}
        <a
          href="/admin/login"
          className="text-[var(--paa-accent-light)] hover:text-[var(--paa-accent)]"
        >
          Sign in
        </a>
      </p>
    </form>
  );
}
