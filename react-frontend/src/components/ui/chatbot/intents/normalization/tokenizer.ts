// tokenizer.ts
export function tokenize(text: string): string[] {
  return text.split(" ").filter(Boolean);
}
