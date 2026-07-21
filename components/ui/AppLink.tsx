import NextLink from 'next/link';
import type { ComponentProps } from 'react';

type AppLinkProps = ComponentProps<typeof NextLink>;

/**
 * Shared navigation link for the static export.
 *
 * Next's segment prefetch responses are intentionally removed from the final
 * artifact, so prefetching them only creates avoidable 404 requests. Individual
 * links can still opt in if their prefetch artifacts are retained in the future.
 */
export function AppLink({ prefetch = false, ...props }: AppLinkProps) {
  return <NextLink prefetch={prefetch} {...props} />;
}

export default AppLink;
