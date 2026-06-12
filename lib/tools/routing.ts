import { redirect } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { getToolById, getLocalizedToolPath } from './registry';

export function redirectToDefaultLocale(): never {
  redirect(`/${routing.defaultLocale}`);
}

export function redirectToolToDefaultLocale(toolId: string): never {
  const tool = getToolById(toolId);

  redirect(tool ? getLocalizedToolPath(tool, routing.defaultLocale) : `/${routing.defaultLocale}`);
}
