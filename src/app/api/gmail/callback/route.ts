import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/db";
import { siteConfig } from "@/db/schema";
import { getGmailCredentialsRaw } from "@/lib/admin-queries";
import { getOAuth2Client } from "@/lib/gmail";
import { google } from "googleapis";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        new URL(`/admin/settings?gmail=error&message=${encodeURIComponent(error)}`, baseUrl)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL("/admin/settings?gmail=error&message=No+authorization+code+received", baseUrl)
      );
    }

    const creds = await getGmailCredentialsRaw();
    if (!creds.gmail_client_id || !creds.gmail_client_secret) {
      return NextResponse.redirect(
        new URL("/admin/settings?gmail=error&message=OAuth+credentials+not+found", baseUrl)
      );
    }

    const oauth2 = getOAuth2Client(creds.gmail_client_id, creds.gmail_client_secret);
    const { tokens } = await oauth2.getToken(code);
    oauth2.setCredentials(tokens);

    // Validate connection by fetching the user's email (confirms gmail.send scope works)
    let userEmail = "";
    try {
      const gmail = google.gmail({ version: "v1", auth: oauth2 });
      const profile = await gmail.users.getProfile({ userId: "me" });
      userEmail = profile.data.emailAddress || "";
    } catch (scopeErr) {
      const errMsg = scopeErr instanceof Error ? scopeErr.message : "";
      if (errMsg.toLowerCase().includes("insufficient") || errMsg.toLowerCase().includes("scope")) {
        return NextResponse.redirect(
          new URL(
            "/admin/settings?gmail=error&message=" +
              encodeURIComponent(
                "Gmail API scope error. Make sure the Gmail API is enabled in your Google Cloud project (APIs & Services → Library → Gmail API → Enable), then try connecting again."
              ),
            baseUrl
          )
        );
      }
      throw scopeErr;
    }

    // Store tokens in site_config
    const db = getDb();
    if (!db) {
      return NextResponse.redirect(
        new URL("/admin/settings?gmail=error&message=Database+not+configured", baseUrl)
      );
    }

    const entries = [
      { key: "gmail_access_token", value: tokens.access_token || "" },
      { key: "gmail_refresh_token", value: tokens.refresh_token || "" },
      { key: "gmail_token_expiry", value: String(tokens.expiry_date || "") },
      { key: "gmail_user_email", value: userEmail },
    ];

    for (const { key, value } of entries) {
      await db
        .insert(siteConfig)
        .values({ key, value })
        .onConflictDoUpdate({ target: siteConfig.key, set: { value, updatedAt: new Date() } });
    }

    return NextResponse.redirect(new URL("/admin/settings?gmail=connected", baseUrl));
  } catch (err) {
    console.error("Gmail callback error:", err);
    const message = encodeURIComponent(err instanceof Error ? err.message : "Unknown error");
    return NextResponse.redirect(
      new URL(`/admin/settings?gmail=error&message=${message}`, baseUrl)
    );
  }
}
