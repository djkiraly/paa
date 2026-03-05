import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { SessionProvider } from "@/components/admin/SessionProvider";

export const metadata = { title: "Admin Login" };

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ activated?: string }>;
}) {
  const { activated } = await searchParams;

  return (
    <SessionProvider>
      <div className="flex min-h-screen items-center justify-center bg-[var(--paa-midnight)]">
        <div className="w-full max-w-md rounded-xl border border-white/10 bg-[var(--paa-navy)] p-8">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-[var(--paa-white)] font-[family-name:var(--font-barlow)]">
              PAA Admin
            </h1>
            <p className="mt-2 text-sm text-[var(--paa-gray)]">
              Sign in to manage your site
            </p>
          </div>
          {activated === "true" && (
            <div className="mb-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-400">
              Account activated successfully! You can now sign in.
            </div>
          )}
          <AdminLoginForm />
        </div>
      </div>
    </SessionProvider>
  );
}
