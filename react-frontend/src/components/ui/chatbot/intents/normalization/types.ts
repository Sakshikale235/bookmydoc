// types.ts
export interface NormalizedInput {
  rawText: string;
  cleanedText: string;
  normalizedText: string;
  tokens: string[];
  corrections: Record<string, string>;
}
