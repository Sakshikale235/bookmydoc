// cleaners.ts
export function cleanText(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}
