import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { getDb } from "@/db";
import { contactSubmissions } from "@/db/schema";
import { getGmailConfig } from "@/lib/admin-queries";
import { sendContactNotification } from "@/lib/gmail";
import { verifyRecaptcha } from "@/lib/recaptcha";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z.email("Invalid email address"),
  organization: z.string().max(200).optional(),
  message: z.string().min(1, "Message is required").max(5000),
  type: z.enum(["general", "partnership", "media"]).default("general"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = contactSchema.parse(body);

    // Verify reCAPTCHA
    const recaptchaResult = await verifyRecaptcha(body.recaptchaToken, "contact");
    if (!recaptchaResult.ok) {
      return NextResponse.json({ error: recaptchaResult.error }, { status: 403 });
    }

    const db = getDb();
    if (!db) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    await db.insert(contactSubmissions).values({
      name: parsed.name,
      email: parsed.email,
      organization: parsed.organization || null,
      message: parsed.message,
      type: parsed.type,
    });

    // Send email notification (fire-and-forget)
    try {
      const gmailConfig = await getGmailConfig();
      if (gmailConfig) {
        await sendContactNotification(gmailConfig, {
          name: parsed.name,
          email: parsed.email,
          organization: parsed.organization,
          message: parsed.message,
          type: parsed.type,
        });
      }
    } catch (emailErr) {
      console.error("Failed to send contact notification email:", emailErr);
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", issues: err.issues },
        { status: 400 }
      );
    }
    console.error("Contact submission error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
