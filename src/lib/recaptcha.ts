import { getSiteConfig } from "@/lib/queries";

const VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";
const MIN_SCORE = 0.5;

export async function verifyRecaptcha(
  token: string | null | undefined,
  expectedAction: string
): Promise<{ ok: boolean; score?: number; error?: string }> {
  const config = await getSiteConfig();

  // If reCAPTCHA is not enabled, skip verification
  if (config.recaptcha_enabled !== "true" || !config.recaptcha_secret_key) {
    return { ok: true };
  }

  if (!token) {
    return { ok: false, error: "reCAPTCHA verification required" };
  }

  try {
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: config.recaptcha_secret_key,
        response: token,
      }),
    });

    const data = await res.json();

    if (!data.success) {
      return { ok: false, score: data.score, error: "reCAPTCHA verification failed" };
    }

    if (data.action && data.action !== expectedAction) {
      return { ok: false, score: data.score, error: "reCAPTCHA action mismatch" };
    }

    if (data.score < MIN_SCORE) {
      return { ok: false, score: data.score, error: "Request flagged as suspicious" };
    }

    return { ok: true, score: data.score };
  } catch {
    // If Google's API is unreachable, allow the request through
    console.error("reCAPTCHA verification request failed");
    return { ok: true };
  }
}
