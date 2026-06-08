import { redirect } from "next/navigation";

import { defaultLocale } from "@/i18n/routing";

export default function AnimationVaultRedirectPage() {
  redirect(`/${defaultLocale}/preview/animation-vault`);
}
