import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({
    locale,
    missing: ['404'],
  }));
}

export default function MissingPage() {
  notFound();
}
