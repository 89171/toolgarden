'use client';

import { useCallback, useSyncExternalStore } from 'react';

const URL_OPTION_CHANGE_EVENT = 'urloptionchange';

function subscribeToUrlOption(onStoreChange: () => void): () => void {
  window.addEventListener(URL_OPTION_CHANGE_EVENT, onStoreChange);
  window.addEventListener('popstate', onStoreChange);
  return () => {
    window.removeEventListener(URL_OPTION_CHANGE_EVENT, onStoreChange);
    window.removeEventListener('popstate', onStoreChange);
  };
}

/** Read a named URL option on load and keep it shareable as the user changes it. */
export function useUrlOption<T extends string | number>(
  parameter: string,
  defaultValue: T,
  options: Readonly<Record<string, T>>,
): readonly [T, (value: T) => void] {
  const getSnapshot = useCallback(() => {
    const requested = new URLSearchParams(window.location.search).get(parameter)?.toLowerCase();
    return requested && Object.hasOwn(options, requested) ? options[requested] : defaultValue;
  }, [defaultValue, options, parameter]);
  const value = useSyncExternalStore(
    subscribeToUrlOption,
    getSnapshot,
    () => defaultValue,
  );

  const selectValue = useCallback((nextValue: T) => {
    const canonicalOption = Object.entries(options).find(([, optionValue]) => optionValue === nextValue)?.[0];
    if (!canonicalOption) return;

    const url = new URL(window.location.href);
    url.searchParams.set(parameter, canonicalOption);
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
    window.dispatchEvent(new Event(URL_OPTION_CHANGE_EVENT));
  }, [options, parameter]);

  return [value, selectValue] as const;
}
