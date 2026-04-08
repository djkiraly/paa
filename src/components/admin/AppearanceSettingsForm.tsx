"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveAppearanceSettings } from "@/lib/admin-actions";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

type Props = {
  initialValues: Record<string, string>;
  gcsConfigured: boolean;
};

const CSS_DEFAULTS: Record<string, string> = {
  theme_midnight: "#0c1a2e",
  theme_navy: "#132b4a",
  theme_slate: "#1a3a6b",
  theme_accent: "#2d6eb5",
  theme_accent_light: "#4a8fd4",
  theme_accent_dark: "#1f5a9a",
  theme_sky: "#7ab8e0",
  theme_sky_light: "#c8e2f5",
  theme_white: "#f0f6fc",
  theme_gray: "#8da4bf",
};

const COLOR_GROUPS = [
  {
    label: "Backgrounds",
    colors: [
      { key: "theme_midnight", label: "Primary Background" },
      { key: "theme_navy", label: "Card / Section Background" },
      { key: "theme_slate", label: "Dark Variant" },
    ],
  },
  {
    label: "Accents",
    colors: [
      { key: "theme_accent", label: "Primary Accent (CTA)" },
      { key: "theme_accent_light", label: "Accent Hover" },
      { key: "theme_accent_dark", label: "Accent Pressed" },
    ],
  },
  {
    label: "Highlights",
    colors: [
      { key: "theme_sky", label: "Light Highlight" },
      { key: "theme_sky_light", label: "Very Light Accent" },
    ],
  },
  {
    label: "Text",
    colors: [
      { key: "theme_white", label: "Primary Text" },
      { key: "theme_gray", label: "Secondary Text" },
    ],
  },
];

export function AppearanceSettingsForm({ initialValues, gcsConfigured }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [colors, setColors] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const key of Object.keys(CSS_DEFAULTS)) {
      init[key] = initialValues[key] || "";
    }
    return init;
  });

  function handleColorChange(key: string, value: string) {
    setColors((prev) => ({ ...prev, [key]: value }));
  }

  function handleReset(key: string) {
    setColors((prev) => ({ ...prev, [key]: "" }));
  }

  function handleResetAll() {
    setColors(Object.fromEntries(Object.keys(CSS_DEFAULTS).map((k) => [k, ""])));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    const formData = new FormData(e.currentTarget);
    // Inject current color state into formData (color pickers aren't native form fields in our setup)
    for (const [key, value] of Object.entries(colors)) {
      formData.set(key, value);
    }
    startTransition(async () => {
      try {
        await saveAppearanceSettings(formData);
        setMessage("Appearance settings saved");
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
          Appearance
        </h3>
        <p className="mt-1 text-sm text-[var(--paa-gray)]">
          Colors, logo, and favicon for public-facing pages
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
        {/* Color Palette */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-medium text-[var(--paa-white)]">Color Palette</h4>
            <button
              type="button"
              onClick={handleResetAll}
              className="text-xs text-[var(--paa-gray)] hover:text-red-400"
            >
              Reset all to defaults
            </button>
          </div>

          {/* Live preview strip */}
          <div className="mb-4 flex gap-1 rounded-lg overflow-hidden border border-white/10">
            {Object.entries(CSS_DEFAULTS).map(([key, defaultVal]) => (
              <div
                key={key}
                className="h-8 flex-1"
                style={{ backgroundColor: colors[key] || defaultVal }}
                title={`${key.replace("theme_", "")}: ${colors[key] || defaultVal}`}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {COLOR_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--paa-gray)]">
                  {group.label}
                </p>
                <div className="space-y-2">
                  {group.colors.map(({ key, label }) => (
                    <ColorField
                      key={key}
                      label={label}
                      value={colors[key]}
                      defaultValue={CSS_DEFAULTS[key]}
                      onChange={(v) => handleColorChange(key, v)}
                      onReset={() => handleReset(key)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Branding */}
        <div className="border-t border-white/10 pt-6">
          <h4 className="mb-3 text-sm font-medium text-[var(--paa-white)]">Branding</h4>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-[var(--paa-gray)] mb-2">
                Logo
              </label>
              {initialValues.logo_url && (
                <div className="mb-2 flex items-center gap-3">
                  <img
                    src={initialValues.logo_url}
                    alt="Current logo"
                    className="h-11 w-11 rounded border border-white/10 object-contain"
                  />
                  <span className="text-xs text-[var(--paa-gray)]">Current logo</span>
                </div>
              )}
              <ImageUploadField
                name="logo_url"
                defaultValue={initialValues.logo_url || ""}
                gcsConfigured={gcsConfigured}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--paa-gray)] mb-2">
                Favicon
              </label>
              {initialValues.favicon_url && (
                <div className="mb-2 flex items-center gap-3">
                  <img
                    src={initialValues.favicon_url}
                    alt="Current favicon"
                    className="h-8 w-8 rounded border border-white/10 object-contain"
                  />
                  <span className="text-xs text-[var(--paa-gray)]">Current favicon</span>
                </div>
              )}
              <ImageUploadField
                name="favicon_url"
                defaultValue={initialValues.favicon_url || ""}
                gcsConfigured={gcsConfigured}
              />
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-4">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-[var(--paa-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--paa-accent-light)] disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save Appearance"}
          </button>
        </div>
      </form>
    </div>
  );
}

function ColorField({
  label,
  value,
  defaultValue,
  onChange,
  onReset,
}: {
  label: string;
  value: string;
  defaultValue: string;
  onChange: (v: string) => void;
  onReset: () => void;
}) {
  const displayValue = value || defaultValue;
  const isOverridden = !!value;

  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={displayValue}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-8 shrink-0 cursor-pointer rounded border border-white/10 bg-transparent p-0.5"
      />
      <input
        type="text"
        value={displayValue}
        onChange={(e) => {
          const v = e.target.value;
          if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange(v);
        }}
        className="w-20 rounded border border-white/10 bg-[var(--paa-midnight)] px-2 py-1 text-xs text-[var(--paa-white)] font-[family-name:var(--font-jetbrains)] focus:border-[var(--paa-accent)] focus:outline-none"
      />
      <span className="flex-1 truncate text-xs text-[var(--paa-gray)]">{label}</span>
      {isOverridden && (
        <button
          type="button"
          onClick={onReset}
          className="shrink-0 text-xs text-[var(--paa-gray)] hover:text-red-400"
          title={`Reset to default (${defaultValue})`}
        >
          Reset
        </button>
      )}
    </div>
  );
}
