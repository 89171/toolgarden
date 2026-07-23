export function parseOrganicKeywords(value: string | undefined): string[] {
  if (!value) return [];

  return Array.from(
    new Set(
      value
        .split(',')
        .map((keyword) => keyword.trim())
        .filter(Boolean)
    )
  );
}

export function formatPrimaryOrganicKeyword(value: string): string {
  return value.replace(/^[a-z]/u, (character) => character.toUpperCase());
}
