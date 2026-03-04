import { AdminHeader } from "@/components/admin/AdminHeader";
import { GcsSettingsForm } from "@/components/admin/GcsSettingsForm";
import { getGcsSettingsRaw } from "@/lib/admin-queries";

export const metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  let gcsValues: Record<string, string> = {};
  try {
    gcsValues = await getGcsSettingsRaw();
  } catch {
    // DB not ready — show empty form
  }

  return (
    <>
      <AdminHeader title="Settings" />
      <div className="p-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SettingsCard
            title="General"
            description="Site name, tagline, contact email, and location"
            status="Coming soon"
          />
          <SettingsCard
            title="SEO & Metadata"
            description="Open Graph, meta descriptions, and social sharing"
            status="Coming soon"
          />
          <SettingsCard
            title="Appearance"
            description="Colors, fonts, and branding options"
            status="Coming soon"
          />
          <GcsSettingsForm initialValues={gcsValues} />
        </div>
      </div>
    </>
  );
}

function SettingsCard({
  title,
  description,
  status,
}: {
  title: string;
  description: string;
  status: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[var(--paa-navy)] p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-[var(--paa-white)] font-[family-name:var(--font-barlow)]">
            {title}
          </h3>
          <p className="mt-1 text-sm text-[var(--paa-gray)]">{description}</p>
        </div>
        <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-[var(--paa-gray)]">
          {status}
        </span>
      </div>
    </div>
  );
}
