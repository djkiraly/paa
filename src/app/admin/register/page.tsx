import { RegisterForm } from "@/components/admin/RegisterForm";

export const metadata = { title: "Register — PAA Admin" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string }>;
}) {
  const { registered } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--paa-midnight)]">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-[var(--paa-navy)] p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-[var(--paa-white)] font-[family-name:var(--font-barlow)]">
            Register
          </h1>
          <p className="mt-2 text-sm text-[var(--paa-gray)]">
            Create an account for the PAA admin portal
          </p>
        </div>
        {registered === "true" ? (
          <div className="text-center">
            <div className="mb-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-400">
              Registration successful! Check your email to verify your account.
            </div>
            <p className="text-sm text-[var(--paa-gray)]">
              After verifying your email, an administrator will review your
              account before you can sign in.
            </p>
            <a
              href="/admin/login"
              className="mt-6 inline-block rounded-lg bg-[var(--paa-accent)] px-6 py-2 text-sm font-semibold text-white hover:bg-[var(--paa-accent-light)]"
            >
              Go to Login
            </a>
          </div>
        ) : (
          <RegisterForm />
        )}
      </div>
    </div>
  );
}
