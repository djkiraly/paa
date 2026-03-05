import { eq, and, isNull } from "drizzle-orm";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { ActivateAccountForm } from "@/components/admin/ActivateAccountForm";

export const metadata = { title: "Activate Account" };

export default async function ActivatePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return <ActivateError message="No activation token provided." />;
  }

  const db = getDb();
  if (!db) {
    return <ActivateError message="System unavailable. Please try again later." />;
  }

  const [user] = await db
    .select({ id: users.id, name: users.name, email: users.email, activatedAt: users.activatedAt })
    .from(users)
    .where(eq(users.activationToken, token))
    .limit(1);

  if (!user) {
    return <ActivateError message="Invalid or expired activation link." />;
  }

  if (user.activatedAt) {
    return <ActivateError message="This account has already been activated. You can log in." />;
  }

  return <ActivateAccountForm token={token} userName={user.name} userEmail={user.email} />;
}

function ActivateError({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--paa-midnight)]">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-[var(--paa-navy)] p-8 text-center">
        <h1 className="text-2xl font-bold text-[var(--paa-white)] font-[family-name:var(--font-barlow)] mb-4">
          Activation Error
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
