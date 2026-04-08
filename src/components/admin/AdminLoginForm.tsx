"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminLoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Pre-check for specific account states
    try {
      const check = await fetch("/api/auth/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const { error: checkError } = await check.json();

      if (checkError === "pending_verification") {
        setLoading(false);
        setError("Your email has not been verified yet. Please check your inbox for the verification link.");
        return;
      }
      if (checkError === "pending_approval") {
        setLoading(false);
        setError("Your account is awaiting admin approval. You will receive an email when your account is approved.");
        return;
      }
      if (checkError === "pending_activation") {
        setLoading(false);
        setError("Your account has not been activated yet. Please check your inbox for the activation link.");
        return;
      }
    } catch {
      // If check fails, fall through to normal signIn
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/admin");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}
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
          className="w-full rounded-lg border border-white/10 bg-[var(--paa-midnight)] px-4 py-3 text-[var(--paa-white)] placeholder:text-[var(--paa-gray)]/50 focus:border-[var(--paa-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--paa-accent)]"
          placeholder="admin@panhandleaviationalliance.org"
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
          autoComplete="current-password"
          className="w-full rounded-lg border border-white/10 bg-[var(--paa-midnight)] px-4 py-3 text-[var(--paa-white)] placeholder:text-[var(--paa-gray)]/50 focus:border-[var(--paa-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--paa-accent)]"
          placeholder="Enter your password"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-[var(--paa-accent)] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--paa-accent-light)] disabled:opacity-50"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
