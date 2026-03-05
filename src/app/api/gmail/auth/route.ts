import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getGmailCredentialsRaw } from "@/lib/admin-queries";
import { getOAuth2Client } from "@/lib/gmail";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const creds = await getGmailCredentialsRaw();
    if (!creds.gmail_client_id || !creds.gmail_client_secret) {
      return NextResponse.redirect(
        new URL("/admin/settings?gmail=error&message=Save+OAuth+credentials+first", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000")
      );
    }

    const oauth2 = getOAuth2Client(creds.gmail_client_id, creds.gmail_client_secret);
    const url = oauth2.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: ["https://www.googleapis.com/auth/gmail.send"],
    });

    return NextResponse.redirect(url);
  } catch (err) {
    console.error("Gmail auth error:", err);
    const message = encodeURIComponent(err instanceof Error ? err.message : "Unknown error");
    return NextResponse.redirect(
      new URL(`/admin/settings?gmail=error&message=${message}`, process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000")
    );
  }
}
