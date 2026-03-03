import { prisma } from "./prisma";

const PUBLIC_KEYS = [
  "siteName",
  "siteDescription",
  "contactEmail",
  "contactPhone",
  "address",
  "businessHours",
  "footerText",
  "aboutContent",
  "faqContent",
  "termsContent",
  "privacyContent",
] as const;

export async function getPublicSettings(): Promise<Record<string, string>> {
  try {
    const rows = await prisma.siteSettings.findMany();
    const settings: Record<string, string> = {};
    for (const row of rows) {
      settings[row.key] = row.value;
    }
    for (const key of PUBLIC_KEYS) {
      if (!(key in settings)) settings[key] = "";
    }
    return settings;
  } catch {
    return Object.fromEntries(PUBLIC_KEYS.map((k) => [k, ""]));
  }
}
