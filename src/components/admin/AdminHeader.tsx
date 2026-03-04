import { auth } from "@/lib/auth";

export async function AdminHeader({ title }: { title: string }) {
  const session = await auth();

  return (
    <header className="flex h-16 items-center justify-between border-b border-white/10 bg-[var(--paa-midnight)] px-8">
      <h1 className="text-xl font-bold text-[var(--paa-white)] font-[family-name:var(--font-barlow)]">
        {title}
      </h1>
      {session?.user?.email && (
        <span className="text-sm text-[var(--paa-gray)]">
          {session.user.email}
        </span>
      )}
    </header>
  );
}
