// inputParsers.ts
export function parseAge(text: string): number | null {
  const n = parseInt(text, 10);
  return n > 0 && n < 120 ? n : null;
}

export function parseGender(text: string): string | null {
  const t = text.toLowerCase();
  if (["male", "female", "other"].includes(t)) return t;
  return null;
}

export function parseHeight(text: string): number | null {
  // expects cm (e.g., 154)
  const n = parseInt(text, 10);
  return n > 50 && n < 250 ? n : null;
}

export function parseWeight(text: string): number | null {
  // expects kg (e.g., 45)
  const n = parseInt(text, 10);
  return n > 10 && n < 300 ? n : null;
}

export function parseLocation(text: string): string | null {
  return text.trim().length >= 2 ? text.trim() : null;
}
