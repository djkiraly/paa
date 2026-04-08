"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveSeoSettings } from "@/lib/admin-actions";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

type Props = {
  initialValues: Record<string, string>;
  gcsConfigured: boolean;
};

const PAGES = [
  { slug: "home", label: "Home" },
  { slug: "about", label: "About" },
  { slug: "airport", label: "Airport" },
  { slug: "initiatives", label: "Initiatives" },
];

export function SeoSettingsForm({ initialValues, gcsConfigured }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [expandedPage, setExpandedPage] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await saveSeoSettings(formData);
        setMessage("SEO settings saved");
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
  const textareaClassName =
    "w-full rounded-lg border border-white/10 bg-[var(--paa-midnight)] px-3 py-2 text-sm text-[var(--paa-white)] focus:border-[var(--paa-accent)] focus:outline-none resize-y";
  const labelClassName = "block text-sm font-medium text-[var(--paa-gray)] mb-1";
  const hintClassName = "mt-1 text-xs text-[var(--paa-gray)]/60";

  return (
    <div className="rounded-xl border border-white/10 bg-[var(--paa-navy)] p-6 lg:col-span-2">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-[var(--paa-white)] font-[family-name:var(--font-barlow)]">
          SEO &amp; Metadata
        </h3>
        <p className="mt-1 text-sm text-[var(--paa-gray)]">
          Search engine optimization, social sharing, and structured data
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
        {/* Global SEO */}
        <div>
          <h4 className="mb-3 text-sm font-medium text-[var(--paa-white)]">
            Global Defaults
          </h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClassName}>Meta Description</label>
              <textarea
                name="seo_description"
                defaultValue={initialValues.seo_description || ""}
                rows={3}
                maxLength={320}
                placeholder="A concise description of the site for search engines (150-160 chars ideal)"
                className={textareaClassName}
              />
              <p className={hintClassName}>
                Appears in search results. Leave empty to auto-generate from site name.
              </p>
            </div>

            <div className="sm:col-span-2">
              <label className={labelClassName}>Keywords</label>
              <input
                name="seo_keywords"
                type="text"
                defaultValue={initialValues.seo_keywords || ""}
                placeholder="aviation, Nebraska, KBFF, air service"
                className={inputClassName}
              />
              <p className={hintClassName}>
                Comma-separated. Leave empty to use defaults.
              </p>
            </div>

            <div>
              <label className={labelClassName}>Twitter / X Handle</label>
              <input
                name="seo_twitter_handle"
                type="text"
                defaultValue={initialValues.seo_twitter_handle || ""}
                placeholder="@yourhandle"
                className={inputClassName}
              />
            </div>

            <div>
              <label className={labelClassName}>Google Search Console Verification</label>
              <input
                name="seo_google_verification"
                type="text"
                defaultValue={initialValues.seo_google_verification || ""}
                placeholder="Verification code from Google"
                className={inputClassName}
              />
              <p className={hintClassName}>
                The content value from the google-site-verification meta tag.
              </p>
            </div>

            <div className="sm:col-span-2">
              <label className={labelClassName}>Default OG Image</label>
              <ImageUploadField
                name="seo_og_image"
                defaultValue={initialValues.seo_og_image || ""}
                gcsConfigured={gcsConfigured}
              />
              <p className={hintClassName}>
                Shown when pages are shared on social media. Recommended: 1200x630px.
              </p>
            </div>
          </div>
        </div>

        {/* Structured Data */}
        <div className="border-t border-white/10 pt-6">
          <h4 className="mb-3 text-sm font-medium text-[var(--paa-white)]">
            Structured Data (JSON-LD)
          </h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClassName}>Organization Type</label>
              <select
                name="seo_organization_type"
                defaultValue={initialValues.seo_organization_type || "Organization"}
                className={inputClassName}
              >
                <option value="Organization">Organization</option>
                <option value="LocalBusiness">Local Business</option>
                <option value="NGO">Non-Governmental Organization</option>
                <option value="GovernmentOrganization">Government Organization</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelClassName}>Organization Description</label>
              <textarea
                name="seo_organization_description"
                defaultValue={initialValues.seo_organization_description || ""}
                rows={2}
                placeholder="Brief description for structured data (may differ from meta description)"
                className={textareaClassName}
              />
            </div>
          </div>
        </div>

        {/* Per-Page Overrides */}
        <div className="border-t border-white/10 pt-6">
          <h4 className="mb-3 text-sm font-medium text-[var(--paa-white)]">
            Per-Page Overrides
          </h4>
          <p className="mb-4 text-xs text-[var(--paa-gray)]">
            Override the title, description, or OG image for individual pages. Leave empty to use global defaults.
          </p>
          <div className="space-y-2">
            {PAGES.map(({ slug, label }) => {
              const isExpanded = expandedPage === slug;
              const hasOverrides =
                !!initialValues[`seo_title_${slug}`] ||
                !!initialValues[`seo_description_${slug}`] ||
                !!initialValues[`seo_og_image_${slug}`];
              return (
                <div
                  key={slug}
                  className="rounded-lg border border-white/5 bg-[var(--paa-midnight)]/50"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedPage(isExpanded ? null : slug)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left"
                  >
                    <span className="flex items-center gap-2 text-sm text-[var(--paa-white)]">
                      {label}
                      {hasOverrides && (
                        <span className="rounded-full bg-[var(--paa-accent)]/10 px-2 py-0.5 text-xs text-[var(--paa-accent-light)]">
                          Customized
                        </span>
                      )}
                    </span>
                    <svg
                      className={`h-4 w-4 text-[var(--paa-gray)] transition-transform ${isExpanded ? "rotate-90" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                  {isExpanded && (
                    <div className="space-y-3 border-t border-white/5 px-4 py-4">
                      <div>
                        <label className={labelClassName}>Title Override</label>
                        <input
                          name={`seo_title_${slug}`}
                          type="text"
                          defaultValue={initialValues[`seo_title_${slug}`] || ""}
                          placeholder="Custom page title"
                          className={inputClassName}
                        />
                      </div>
                      <div>
                        <label className={labelClassName}>Description Override</label>
                        <textarea
                          name={`seo_description_${slug}`}
                          defaultValue={initialValues[`seo_description_${slug}`] || ""}
                          rows={2}
                          placeholder="Custom meta description for this page"
                          className={textareaClassName}
                        />
                      </div>
                      <div>
                        <label className={labelClassName}>OG Image Override</label>
                        <ImageUploadField
                          name={`seo_og_image_${slug}`}
                          defaultValue={initialValues[`seo_og_image_${slug}`] || ""}
                          gcsConfigured={gcsConfigured}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-white/10 pt-4">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-[var(--paa-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--paa-accent-light)] disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save SEO Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
