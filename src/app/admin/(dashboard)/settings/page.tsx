import { Suspense } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { GeneralSettingsForm } from "@/components/admin/GeneralSettingsForm";
import { AppearanceSettingsForm } from "@/components/admin/AppearanceSettingsForm";
import { SeoSettingsForm } from "@/components/admin/SeoSettingsForm";
import { PolicySettingsForm } from "@/components/admin/PolicySettingsForm";
import { RecaptchaSettingsForm } from "@/components/admin/RecaptchaSettingsForm";
import { GcsSettingsForm } from "@/components/admin/GcsSettingsForm";
import { GmailSettingsForm } from "@/components/admin/GmailSettingsForm";
import {
  getGeneralSettingsRaw,
  getAppearanceSettingsRaw,
  getSeoSettingsRaw,
  getPolicySettingsRaw,
  getRecaptchaSettingsRaw,
  getGcsSettingsRaw,
  getGcsConfig,
  getGmailSettingsRaw,
} from "@/lib/admin-queries";

export const metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  let generalValues: Record<string, string> = {};
  let appearanceValues: Record<string, string> = {};
  let seoValues: Record<string, string> = {};
  let policyValues: Record<string, string> = {};
  let recaptchaValues: Record<string, string> = {};
  let gcsValues: Record<string, string> = {};
  let gmailValues: Record<string, string> = {};
  let gcsConfigured = false;
  try {
    [generalValues, appearanceValues, seoValues, policyValues, recaptchaValues, gcsValues, gmailValues] =
      await Promise.all([
        getGeneralSettingsRaw(),
        getAppearanceSettingsRaw(),
        getSeoSettingsRaw(),
        getPolicySettingsRaw(),
        getRecaptchaSettingsRaw(),
        getGcsSettingsRaw(),
        getGmailSettingsRaw(),
      ]);
    const gcsConfig = await getGcsConfig();
    gcsConfigured = !!gcsConfig;
  } catch {
    // DB not ready — show empty forms
  }

  return (
    <>
      <AdminHeader title="Settings" />
      <div className="p-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <GeneralSettingsForm initialValues={generalValues} />
          <GcsSettingsForm initialValues={gcsValues} />
          <AppearanceSettingsForm
            initialValues={appearanceValues}
            gcsConfigured={gcsConfigured}
          />
          <SeoSettingsForm
            initialValues={seoValues}
            gcsConfigured={gcsConfigured}
          />
          <PolicySettingsForm initialValues={policyValues} />
          <RecaptchaSettingsForm initialValues={recaptchaValues} />
          <Suspense>
            <GmailSettingsForm initialValues={gmailValues} />
          </Suspense>
        </div>
      </div>
    </>
  );
}
