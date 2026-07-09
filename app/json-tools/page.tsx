import { redirect } from 'next/navigation';
import { routing } from '@/i18n/routing';

export default function JsonToolsHubRedirectPage() {
  redirect(`/${routing.defaultLocale}/json-tools`);
}
