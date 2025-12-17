// normalizer.ts
import { cleanText } from "./cleaners";
import { tokenize } from "./tokenizer";
import { synonymMap } from "./synonymMap";
import { medicalMap } from "./medicalMap";
import { correctSpelling } from "./spellCorrector";
import { NormalizedInput } from "./types";

export function normalizeInput(rawText: string): NormalizedInput {
  const cleanedText = cleanText(rawText);
  let tokens = tokenize(cleanedText);

  const corrections: Record<string, string> = {};

  tokens = tokens.map(token => {
    const corrected = correctSpelling(token);
    if (corrected && corrected !== token) {
      corrections[token] = corrected;
      return corrected;
    }
    return token;
  });

  let normalizedText = tokens.join(" ");

  for (const phrase in synonymMap) {
    if (normalizedText.includes(phrase)) {
      normalizedText = normalizedText.replace(
        phrase,
        synonymMap[phrase]
      );
    }
  }

  for (const term in medicalMap) {
    if (normalizedText.includes(term)) {
      normalizedText = normalizedText.replace(
        term,
        medicalMap[term]
      );
    }
  }

  return {
    rawText,
    cleanedText,
    normalizedText,
    tokens: normalizedText.split(" ").filter(Boolean),
    corrections
  };
}
