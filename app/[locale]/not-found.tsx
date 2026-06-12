'use client';

import { useLocale } from 'next-intl';
import { NotFoundContent } from '@/components/NotFoundContent';

export default function LocaleNotFound() {
  const locale = useLocale();

  return <NotFoundContent locale={locale} />;
}
