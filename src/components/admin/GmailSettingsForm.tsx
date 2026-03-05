"use client";

import { useState, useTransition, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  saveGmailSettings,
  testGmailConnectionAction,
  disconnectGmail,
} from "@/lib/admin-actions";

type Props = {
  initialValues: Record<string, string>;
};

export function GmailSettingsForm({ initialValues }: Props) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [testResult, setTestResult] = useState<{ ok: boolean; error?: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const searchParams = useSearchParams();

  const hasCredentials =
    !!initialValues.gmail_client_id && !!initialValues.gmail_client_secret;
  const isConnected = !!initialValues.gmail_access_token && !!initialValues.gmail_refresh_token;
  const connectedEmail = initialValues.gmail_user_email || "";

  // Handle OAuth redirect result
  useEffect(() => {
    const gmailParam = searchParams.get("gmail");
    if (gmailParam === "connected") {
      setMessage("Gmail connected successfully");
      setMessageType("success");
    } else if (gmailParam === "error") {
      const errorMsg = searchParams.get("message") || "Connection failed";
      setMessage(errorMsg);
      setMessageType("error");
    }
  }, [searchParams]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setTestResult(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await saveGmailSettings(formData);
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
    testGmailConnectionAction()
      .then((result) => setTestResult(result))
      .catch(() => setTestResult({ ok: false, error: "Test request failed" }))
      .finally(() => setIsTesting(false));
  }

  function handleDisconnect() {
    setIsDisconnecting(true);
    startTransition(async () => {
      try {
        await disconnectGmail();
        setMessage("Gmail disconnected");
        setMessageType("success");
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "Disconnect failed");
        setMessageType("error");
      } finally {
        setIsDisconnecting(false);
      }
    });
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[var(--paa-navy)] p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-[var(--paa-white)] font-[family-name:var(--font-barlow)]">
            Gmail Notifications
          </h3>
          <p className="mt-1 text-sm text-[var(--paa-gray)]">
            Email notifications for contact form submissions
          </p>
        </div>
        <GmailStatusBadge
          hasCredentials={hasCredentials}
          isConnected={isConnected}
          testResult={testResult}
        />
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
            OAuth Client ID
          </label>
          <input
            name="gmail_client_id"
            type="text"
            defaultValue={initialValues.gmail_client_id || ""}
            placeholder="123456789.apps.googleusercontent.com"
            className="w-full rounded-lg border border-white/10 bg-[var(--paa-midnight)] px-3 py-2 text-sm text-[var(--paa-white)] focus:border-[var(--paa-accent)] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--paa-gray)] mb-1">
            OAuth Client Secret
          </label>
          <input
            name="gmail_client_secret"
            type="password"
            defaultValue={initialValues.gmail_client_secret || ""}
            placeholder="GOCSPX-..."
            className="w-full rounded-lg border border-white/10 bg-[var(--paa-midnight)] px-3 py-2 text-sm text-[var(--paa-white)] focus:border-[var(--paa-accent)] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--paa-gray)] mb-1">
            Notification Recipient Email
          </label>
          <input
            name="gmail_notification_to"
            type="email"
            defaultValue={initialValues.gmail_notification_to || ""}
            placeholder="admin@panhandleaviationalliance.org"
            className="w-full rounded-lg border border-white/10 bg-[var(--paa-midnight)] px-3 py-2 text-sm text-[var(--paa-white)] focus:border-[var(--paa-accent)] focus:outline-none"
          />
          <p className="mt-1 text-xs text-[var(--paa-gray)]">
            Contact form submissions will be sent to this address.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-[var(--paa-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--paa-accent-light)] disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save Settings"}
          </button>

          {hasCredentials && !isConnected && (
            <a
              href="/api/gmail/auth"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-[var(--paa-gray)] hover:text-[var(--paa-white)] hover:border-white/20"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Connect Gmail
            </a>
          )}

          {isConnected && (
            <>
              <button
                type="button"
                onClick={handleTest}
                disabled={isTesting}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm text-[var(--paa-gray)] hover:text-[var(--paa-white)] hover:border-white/20 disabled:opacity-50"
              >
                {isTesting ? "Sending..." : "Test Send"}
              </button>
              <button
                type="button"
                onClick={handleDisconnect}
                disabled={isDisconnecting}
                className="rounded-lg border border-red-500/20 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 disabled:opacity-50"
              >
                {isDisconnecting ? "Disconnecting..." : "Disconnect"}
              </button>
            </>
          )}
        </div>

        {isConnected && connectedEmail && (
          <p className="text-xs text-green-400">
            Connected as {connectedEmail}
          </p>
        )}

        {testResult && (
          <div
            className={`rounded-lg px-4 py-3 text-sm ${
              testResult.ok
                ? "bg-green-500/10 border border-green-500/20 text-green-400"
                : "bg-red-500/10 border border-red-500/20 text-red-400"
            }`}
          >
            {testResult.ok
              ? "Test email sent successfully — check your inbox"
              : `Send failed: ${testResult.error}`}
          </div>
        )}
      </form>
    </div>
  );
}

function GmailStatusBadge({
  hasCredentials,
  isConnected,
  testResult,
}: {
  hasCredentials: boolean;
  isConnected: boolean;
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
  if (isConnected) {
    return (
      <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400">
        Connected
      </span>
    );
  }
  if (hasCredentials) {
    return (
      <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs text-amber-400">
        Credentials saved
      </span>
    );
  }
  return (
    <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-[var(--paa-gray)]">
      Not configured
    </span>
  );
}
