"use client";

import { useState } from "react";

type FormState = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("submitting");
    setErrorMsg("");

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      organization: (form.elements.namedItem("organization") as HTMLInputElement).value || undefined,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
      type: "general",
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Something went wrong");
      }

      setState("success");
      form.reset();
    } catch (err) {
      setState("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (state === "success") {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center sm:p-8">
        <div className="mb-2 text-2xl">&#10003;</div>
        <h3 className="mb-2 font-heading text-lg font-bold text-paa-white">
          Message Sent
        </h3>
        <p className="text-sm text-paa-gray">
          Thank you for reaching out. We&apos;ll be in touch soon.
        </p>
        <button
          onClick={() => setState("idle")}
          className="mt-4 text-sm text-accent underline transition-colors hover:text-accent-light"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="name" className="mb-1 block font-heading text-sm uppercase tracking-wider text-paa-gray">
          Name *
        </label>
        <input
          id="name"
          name="name"
          required
          className="w-full rounded-lg border border-white/10 bg-navy/50 px-4 py-3 text-sm text-paa-white placeholder-paa-gray/50 outline-none transition-colors focus:border-accent/50 focus:ring-1 focus:ring-accent/25"
          placeholder="Your name"
        />
      </div>
      <div>
        <label htmlFor="email" className="mb-1 block font-heading text-sm uppercase tracking-wider text-paa-gray">
          Email *
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-lg border border-white/10 bg-navy/50 px-4 py-3 text-sm text-paa-white placeholder-paa-gray/50 outline-none transition-colors focus:border-accent/50 focus:ring-1 focus:ring-accent/25"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label htmlFor="organization" className="mb-1 block font-heading text-sm uppercase tracking-wider text-paa-gray">
          Organization
        </label>
        <input
          id="organization"
          name="organization"
          className="w-full rounded-lg border border-white/10 bg-navy/50 px-4 py-3 text-sm text-paa-white placeholder-paa-gray/50 outline-none transition-colors focus:border-accent/50 focus:ring-1 focus:ring-accent/25"
          placeholder="Your organization (optional)"
        />
      </div>
      <div>
        <label htmlFor="message" className="mb-1 block font-heading text-sm uppercase tracking-wider text-paa-gray">
          Message *
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          className="w-full resize-none rounded-lg border border-white/10 bg-navy/50 px-4 py-3 text-sm text-paa-white placeholder-paa-gray/50 outline-none transition-colors focus:border-accent/50 focus:ring-1 focus:ring-accent/25"
          placeholder="How can we help?"
        />
      </div>
      {state === "error" && (
        <p className="text-sm text-red-400">{errorMsg}</p>
      )}
      <button
        type="submit"
        disabled={state === "submitting"}
        className="rounded-full bg-accent px-6 py-3 font-heading text-sm font-bold uppercase tracking-wider text-midnight transition-colors hover:bg-accent-light disabled:opacity-50"
      >
        {state === "submitting" ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
