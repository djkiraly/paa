import { google } from "googleapis";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { siteConfig } from "@/db/schema";

export type GmailConfig = {
  clientId: string;
  clientSecret: string;
  notificationTo: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiry: string;
  userEmail: string;
};

const REDIRECT_PATH = "/api/gmail/callback";

function getRedirectUri() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return `${base.replace(/\/$/, "")}${REDIRECT_PATH}`;
}

export function getOAuth2Client(clientId: string, clientSecret: string) {
  return new google.auth.OAuth2(clientId, clientSecret, getRedirectUri());
}

export function getGmailClient(config: GmailConfig) {
  const oauth2 = getOAuth2Client(config.clientId, config.clientSecret);
  oauth2.setCredentials({
    access_token: config.accessToken,
    refresh_token: config.refreshToken,
    expiry_date: Number(config.tokenExpiry),
  });

  oauth2.on("tokens", async (tokens) => {
    try {
      const db = getDb();
      if (!db) return;
      const updates: { key: string; value: string }[] = [];
      if (tokens.access_token) {
        updates.push({ key: "gmail_access_token", value: tokens.access_token });
      }
      if (tokens.expiry_date) {
        updates.push({ key: "gmail_token_expiry", value: String(tokens.expiry_date) });
      }
      if (tokens.refresh_token) {
        updates.push({ key: "gmail_refresh_token", value: tokens.refresh_token });
      }
      for (const { key, value } of updates) {
        await db
          .insert(siteConfig)
          .values({ key, value })
          .onConflictDoUpdate({ target: siteConfig.key, set: { value, updatedAt: new Date() } });
      }
    } catch (err) {
      console.error("Failed to persist refreshed Gmail tokens:", err);
    }
  });

  return google.gmail({ version: "v1", auth: oauth2 });
}

function buildRfc2822(from: string, to: string, subject: string, bodyHtml: string): string {
  const boundary = "boundary_" + Date.now().toString(36);
  const lines = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    `Content-Type: text/html; charset="UTF-8"`,
    "",
    bodyHtml,
    "",
    `--${boundary}--`,
  ];
  return lines.join("\r\n");
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function sendEmail(
  config: GmailConfig,
  to: string,
  subject: string,
  bodyHtml: string
): Promise<void> {
  const gmail = getGmailClient(config);
  const raw = base64UrlEncode(buildRfc2822(config.userEmail, to, subject, bodyHtml));
  await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw },
  });
}

export async function testGmailConnection(
  config: GmailConfig
): Promise<{ ok: boolean; error?: string }> {
  try {
    const subject = "PAA Gmail Integration Test";
    const body = `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2 style="color: #2d6eb5;">Gmail Integration Test</h2>
        <p>This is a test email from the Panhandle Aviation Alliance admin portal.</p>
        <p>If you received this, Gmail notifications are working correctly.</p>
        <p style="color: #8da4bf; font-size: 12px;">Sent at ${new Date().toISOString()}</p>
      </div>
    `;
    await sendEmail(config, config.notificationTo, subject, body);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export async function sendContactNotification(
  config: GmailConfig,
  contact: { name: string; email: string; organization?: string | null; message: string; type: string }
): Promise<void> {
  const subject = `New Contact Form Submission — ${contact.type} — ${contact.name}`;
  const body = `
    <div style="font-family: Arial, sans-serif; max-width: 600px;">
      <h2 style="color: #2d6eb5; margin-bottom: 16px;">New Contact Form Submission</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 12px; font-weight: bold; color: #8da4bf; width: 120px;">Name</td>
          <td style="padding: 8px 12px; color: #f0f6fc;">${escapeHtml(contact.name)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; font-weight: bold; color: #8da4bf;">Email</td>
          <td style="padding: 8px 12px;"><a href="mailto:${escapeHtml(contact.email)}" style="color: #2d6eb5;">${escapeHtml(contact.email)}</a></td>
        </tr>
        ${contact.organization ? `
        <tr>
          <td style="padding: 8px 12px; font-weight: bold; color: #8da4bf;">Organization</td>
          <td style="padding: 8px 12px; color: #f0f6fc;">${escapeHtml(contact.organization)}</td>
        </tr>` : ""}
        <tr>
          <td style="padding: 8px 12px; font-weight: bold; color: #8da4bf;">Type</td>
          <td style="padding: 8px 12px; color: #f0f6fc;">${escapeHtml(contact.type)}</td>
        </tr>
      </table>
      <div style="margin-top: 16px; padding: 16px; background: #132b4a; border-radius: 8px;">
        <p style="color: #8da4bf; font-weight: bold; margin: 0 0 8px 0;">Message</p>
        <p style="color: #f0f6fc; white-space: pre-wrap; margin: 0;">${escapeHtml(contact.message)}</p>
      </div>
      <p style="color: #8da4bf; font-size: 12px; margin-top: 16px;">
        View in admin portal: ${process.env.NEXT_PUBLIC_SITE_URL || ""}/admin/contacts
      </p>
    </div>
  `;
  await sendEmail(config, config.notificationTo, subject, body);
}

export async function sendActivationEmail(
  config: GmailConfig,
  user: { name: string | null; email: string; activationToken: string }
): Promise<void> {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const activationUrl = `${siteUrl}/admin/activate?token=${user.activationToken}`;
  const displayName = user.name || user.email;
  const subject = `You've been invited to PAA Admin`;
  const body = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2d6eb5; margin-bottom: 16px;">Welcome to PAA Admin</h2>
      <p style="color: #333; font-size: 16px;">
        Hello ${escapeHtml(displayName)},
      </p>
      <p style="color: #333; font-size: 16px;">
        You've been invited to the Panhandle Aviation Alliance admin portal.
        Click the button below to activate your account and set your password.
      </p>
      <div style="margin: 32px 0; text-align: center;">
        <a href="${activationUrl}" style="display: inline-block; background: #2d6eb5; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
          Activate Your Account
        </a>
      </div>
      <p style="color: #666; font-size: 14px;">
        Or copy and paste this link into your browser:
      </p>
      <p style="color: #2d6eb5; font-size: 14px; word-break: break-all;">
        ${activationUrl}
      </p>
      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;" />
      <p style="color: #999; font-size: 12px;">
        If you did not expect this invitation, you can safely ignore this email.
      </p>
    </div>
  `;
  await sendEmail(config, user.email, subject, body);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
