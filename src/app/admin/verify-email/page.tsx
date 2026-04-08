import { eq, and, isNull } from "drizzle-orm";
import { isNotNull } from "drizzle-orm";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { VerifyEmailButton } from "./VerifyEmailButton";

export const metadata = { title: "Verify Email — PAA Admin" };

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return <VerifyError message="No verification token provided." />;
  }

  const db = getDb();
  if (!db) {
    return <VerifyError message="System unavailable. Please try again later." />;
  }

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      emailVerified: users.emailVerified,
      activatedAt: users.activatedAt,
    })
    .from(users)
    .where(
      and(
        eq(users.activationToken, token),
        isNull(users.activatedAt),
        isNotNull(users.passwordHash)
      )
    )
    .limit(1);

  if (!user) {
    return <VerifyError message="Invalid or expired verification link." />;
  }

  if (user.emailVerified) {
    return (
      <VerifyError message="Your email has already been verified. Your account is awaiting admin approval." />
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--paa-midnight)]">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-[var(--paa-navy)] p-8 text-center">
        <h1 className="text-2xl font-bold text-[var(--paa-white)] font-[family-name:var(--font-barlow)] mb-4">
          Verify Your Email
        </h1>
        <p className="text-[var(--paa-gray)] mb-2">
          {user.email}
        </p>
        <p className="text-sm text-[var(--paa-gray)] mb-6">
          Click the button below to confirm your email address.
        </p>
        <VerifyEmailButton token={token} />
      </div>
    </div>
  );
}

function VerifyError({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--paa-midnight)]">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-[var(--paa-navy)] p-8 text-center">
        <h1 className="text-2xl font-bold text-[var(--paa-white)] font-[family-name:var(--font-barlow)] mb-4">
          Email Verification
        </h1>
        <p className="text-[var(--paa-gray)]">{message}</p>
        <a
          href="/admin/login"
          className="mt-6 inline-block rounded-lg bg-[var(--paa-accent)] px-6 py-2 text-sm font-semibold text-white hover:bg-[var(--paa-accent-light)]"
        >
          Go to Login
        </a>
      </div>
    </div>
  );
}
