import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { compare } from "bcryptjs";
import { verifyRecaptcha } from "@/lib/recaptcha";

export async function POST(request: Request) {
  const { email, password, recaptchaToken } = await request.json();
  if (!email || !password) {
    return NextResponse.json({ error: "invalid_credentials" });
  }

  // Verify reCAPTCHA
  const recaptchaResult = await verifyRecaptcha(recaptchaToken, "login");
  if (!recaptchaResult.ok) {
    return NextResponse.json({ error: "recaptcha_failed" });
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "invalid_credentials" });
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    return NextResponse.json({ error: "invalid_credentials" });
  }

  // Self-registered, email not verified yet
  if (user.passwordHash && !user.emailVerified) {
    return NextResponse.json({ error: "pending_verification" });
  }

  // Email verified but not approved by admin
  if (user.passwordHash && user.emailVerified && !user.activatedAt) {
    return NextResponse.json({ error: "pending_approval" });
  }

  // Admin-invited, hasn't activated yet
  if (!user.passwordHash) {
    return NextResponse.json({ error: "pending_activation" });
  }

  // Check password
  const valid = await compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "invalid_credentials" });
  }

  return NextResponse.json({ error: null });
}
