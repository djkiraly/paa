"use client";

import { useState, useTransition } from "react";
import { saveGcsSettings, testGcsConnectionAction } from "@/lib/admin-actions";

type Props = {
  initialValues: Record<string, string>;
};

export function GcsSettingsForm({ initialValues }: Props) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [testResult, setTestResult] = useState<{ ok: boolean; error?: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [credentialsLoaded, setCredentialsLoaded] = useState(
    !!initialValues.gcs_credentials
  );
  const [cdnUrl, setCdnUrl] = useState(initialValues.gcs_cdn_base_url || "");
  const [bucketName, setBucketName] = useState(initialValues.gcs_bucket_name || "");

  const hasConfig =
    !!initialValues.gcs_project_id &&
    !!initialValues.gcs_bucket_name &&
    !!initialValues.gcs_credentials;

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      try {
        JSON.parse(text);
        const hidden = document.getElementById(
          "gcs_credentials_hidden"
        ) as HTMLInputElement;
        if (hidden) hidden.value = text;
        setCredentialsLoaded(true);
        setMessage("");
      } catch {
        setMessage("Invalid JSON file");
        setMessageType("error");
      }
    };
    reader.readAsText(file);
  }

  function handleBucketChange(value: string) {
    setBucketName(value);
    if (!cdnUrl || cdnUrl.includes("storage.googleapis.com")) {
      setCdnUrl(
        value ? `https://storage.googleapis.com/${value}` : ""
      );
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setTestResult(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await saveGcsSettings(formData);
        setMessage("Settings saved");
        setMessageType("success");
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "Save failed");
        setMessageType("error");
      }
    });
  }

  function handleTest() {
    setIsTesting(true);
    setTestResult(null);
    testGcsConnectionAction()
      .then((result) => setTestResult(result))
      .catch(() => setTestResult({ ok: false, error: "Test request failed" }))
      .finally(() => setIsTesting(false));
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[var(--paa-navy)] p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-[var(--paa-white)] font-[family-name:var(--font-barlow)]">
            Google Cloud Storage
          </h3>
          <p className="mt-1 text-sm text-[var(--paa-gray)]">
            CDN for images and media uploads
          </p>
        </div>
        <StatusBadge hasConfig={hasConfig} testResult={testResult} />
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
            Project ID
          </label>
          <input
            name="gcs_project_id"
            type="text"
            defaultValue={initialValues.gcs_project_id || ""}
            placeholder="my-gcp-project"
            className="w-full rounded-lg border border-white/10 bg-[var(--paa-midnight)] px-3 py-2 text-sm text-[var(--paa-white)] focus:border-[var(--paa-accent)] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--paa-gray)] mb-1">
            Bucket Name
          </label>
          <input
            name="gcs_bucket_name"
            type="text"
            value={bucketName}
            onChange={(e) => handleBucketChange(e.target.value)}
            placeholder="my-bucket"
            className="w-full rounded-lg border border-white/10 bg-[var(--paa-midnight)] px-3 py-2 text-sm text-[var(--paa-white)] focus:border-[var(--paa-accent)] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--paa-gray)] mb-1">
            CDN Base URL
          </label>
          <input
            name="gcs_cdn_base_url"
            type="text"
            value={cdnUrl}
            onChange={(e) => setCdnUrl(e.target.value)}
            placeholder="https://storage.googleapis.com/my-bucket"
            className="w-full rounded-lg border border-white/10 bg-[var(--paa-midnight)] px-3 py-2 text-sm text-[var(--paa-white)] focus:border-[var(--paa-accent)] focus:outline-none"
          />
          <p className="mt-1 text-xs text-[var(--paa-gray)]">
            Auto-derived from bucket name. Override for custom CDN domain.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--paa-gray)] mb-1">
            Service Account JSON Key
          </label>
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="w-full text-sm text-[var(--paa-gray)] file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-sm file:text-[var(--paa-white)] hover:file:bg-white/20"
          />
          <input type="hidden" id="gcs_credentials_hidden" name="gcs_credentials" />
          {credentialsLoaded && (
            <p className="mt-1 text-xs text-green-400">
              {initialValues.gcs_credentials && !message
                ? "Credentials configured"
                : "Key file loaded"}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-[var(--paa-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--paa-accent-light)] disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save Settings"}
          </button>
          <button
            type="button"
            onClick={handleTest}
            disabled={isTesting}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-[var(--paa-gray)] hover:text-[var(--paa-white)] hover:border-white/20 disabled:opacity-50"
          >
            {isTesting ? "Testing..." : "Test Connection"}
          </button>
        </div>

        {testResult && (
          <div
            className={`rounded-lg px-4 py-3 text-sm ${
              testResult.ok
                ? "bg-green-500/10 border border-green-500/20 text-green-400"
                : "bg-red-500/10 border border-red-500/20 text-red-400"
            }`}
          >
            {testResult.ok
              ? "Connection successful — bucket is accessible"
              : `Connection failed: ${testResult.error}`}
          </div>
        )}
      </form>
    </div>
  );
}

function StatusBadge({
  hasConfig,
  testResult,
}: {
  hasConfig: boolean;
  testResult: { ok: boolean } | null;
}) {
  if (testResult?.ok) {
    return (
      <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400">
        Connected
      </span>
    );
  }
  if (testResult && !testResult.ok) {
    return (
      <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs text-red-400">
        Error
      </span>
    );
  }
  if (hasConfig) {
    return (
      <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs text-amber-400">
        Configured
      </span>
    );
  }
  return (
    <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-[var(--paa-gray)]">
      Not configured
    </span>
  );
}
