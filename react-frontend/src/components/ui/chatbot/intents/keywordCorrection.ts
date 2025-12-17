// src/components/ui/chatbot/intents/keywordCorrection.ts
// Upgraded spell/phrase correction utilities.
// Import medical dictionary (array of words) placed at src/data/medical_dictionary.json
import DICT from "../../../../data/medical_dictionary.json";

export type Buckets = Record<string, string[]>;

/**
 * PHRASE_MAP: domain-specific phrase normalizations and Hinglish -> English mappings.
 * Add or expand entries as you find new common user phrasings.
 */
export const PHRASE_MAP: Record<string, string> = {
  // Hinglish / slang common mappings
  "bukhar": "fever",
  "khasi": "cough",
  "khansi": "cough",
  "dard": "pain",
  "bukhaar": "fever",
  "sardi": "cold",
  "saans lene mein dikat": "difficulty breathing",
  "saans phoolna": "shortness of breath",
  // longer phrases (prefer longest-first replacement in applyPhraseMap)
  "pain while peeing": "burning urination",
  "pain while urinating": "burning urination",
  "painful urination": "burning urination",
  "fever since morning": "fever",
  "runny nose and cough": "cold",
  "sore throat and fever": "pharyngitis",
  "breathless on exertion": "dyspnea on exertion",
  "vomiting and diarrhea": "gastroenteritis",
  "lower abdominal pain": "lower abdominal pain",
  // you can add more as you collect data
};

/**
 * Build simple bucketed index keyed by first letter to reduce Levenshtein comparisons.
 */
function buildBuckets(words: string[]): Buckets {
  const b: Buckets = {};
  for (const w of words) {
    if (!w || typeof w !== "string") continue;
    const first = w[0] ? w[0].toLowerCase() : "#";
    if (!b[first]) b[first] = [];
    b[first].push(w);
  }
  return b;
}

/**
 * Fast-ish Levenshtein distance implementation (iterative, O(mn) time, O(min(m,n)) space).
 * Works well for short tokens (medical keywords).
 */
function levenshtein(a: string, b: string): number {
  // make sure a is the shorter string to keep space low
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  if (a.length > b.length) {
    const tmp = a;
    a = b;
    b = tmp;
  }

  let previous = new Array(a.length + 1);
  for (let i = 0; i <= a.length; i++) previous[i] = i;

  for (let j = 1; j <= b.length; j++) {
    let current = [j];
    const bj = b.charAt(j - 1);
    for (let i = 1; i <= a.length; i++) {
      const substitutionCost = a.charAt(i - 1) === bj ? 0 : 1;
      const insertCost = current[i - 1] + 1;
      const deleteCost = previous[i] + 1;
      const substituteCost = previous[i - 1] + substitutionCost;
      current[i] = Math.min(insertCost, deleteCost, substituteCost);
    }
    previous = current;
  }

  return previous[a.length];
}

/**
 * Bucket the dictionary once.
 */
const BUCKETS = buildBuckets((DICT as string[]).map((s) => s.toLowerCase()));

/**
 * getCandidates: return candidate words from dictionary that are likely similar.
 * Limits by first letter and length delta to reduce comparisons.
 */
function getCandidates(token: string): string[] {
  if (!token) return [];
  const first = token[0] ? token[0].toLowerCase() : "#";
  const candidates = BUCKETS[first] || [];
  const len = token.length;
  // allow length difference up to 3 to be forgiving for common typos (tuneable)
  return candidates.filter((c) => Math.abs(c.length - len) <= 3);
}

/**
 * correctWord: attempt to replace a single token with dictionary match if within maxDistance.
 * Returns original token if no confident correction found.
 */
export function correctWord(token: string, maxDistance = 2): string {
  if (!token) return token;
  // Preserve numbers, emails, slugs etc.
  if (/^\d+$/.test(token) || /\d+[\w-]*@/.test(token)) return token;
  const lower = token.toLowerCase();
  // quick exact check
  if ((DICT as string[]).includes(lower)) return lower;

  const candidates = getCandidates(lower);
  if (!candidates.length) return token;

  let best = lower;
  let bestScore = Infinity;
  for (const c of candidates) {
    const dist = levenshtein(lower, c.toLowerCase());
    if (dist < bestScore) {
      bestScore = dist;
      best = c;
    }
    // perfect match early exit
    if (bestScore === 0) break;
  }

  return bestScore <= maxDistance ? best : token;
}

/**
 * correctSentence: corrects tokens in a sentence (preserves punctuation around words).
 * It uses correctWord and keeps numeric tokens untouched.
 */
export function correctSentence(sentence: string, maxDistance = 2): string {
  if (!sentence) return sentence;
  // split on whitespace but preserve punctuation for re-attachment
  const tokens = sentence.split(/\s+/);
  const corrected = tokens.map((t) => {
    if (!t) return t;
    // detect and preserve leading/trailing punctuation
    const prefixMatch = t.match(/^[^\wа-яёА-ЯЁ]*/u);
    const suffixMatch = t.match(/[^\wа-яёА-ЯЁ]*$/u);
    const prefix = prefixMatch ? prefixMatch[0] : "";
    const suffix = suffixMatch ? suffixMatch[0] : "";
    const core = t.replace(/^[^\wа-яёА-ЯЁ]+|[^\wа-яёА-ЯЁ]+$/gu, "");
    if (!core) return t;
    // if purely numeric keep as-is
    if (/^\d+$/.test(core)) return prefix + core + suffix;
    const correctedCore = correctWord(core, maxDistance);
    return prefix + correctedCore + suffix;
  });
  return corrected.join(" ");
}

/**
 * applyPhraseMap: replace longer phrases first to avoid partial overlaps.
 * This does a lowercased match and replacement (returns lowercased normalized string).
 */
export function applyPhraseMap(text: string): string {
  if (!text) return text;
  let out = text.toLowerCase();
  // sort keys longest-first so multi-word phrases get replaced before their parts
  const keys = Object.keys(PHRASE_MAP).sort((a, b) => b.length - a.length);
  for (const k of keys) {
    const v = PHRASE_MAP[k];
    // use word boundary aware replacement to avoid mid-word swaps
    const re = new RegExp("\\b" + k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "g");
    out = out.replace(re, v.toLowerCase());
  }
  return out;
}

/**
 * normalizeText: convenience pipeline: phrase mapping -> token correction -> trim/normalize spacing.
 * Returns a cleaned, lowercased string best-suited for entity extraction.
 */
export function normalizeText(raw: string): string {
  if (!raw) return raw;
  // 1) apply phrase map (Hinglish → english / phrase normalization)
  let t = applyPhraseMap(raw);
  // 2) correct obvious word typos (keeps punctuation where possible)
  t = correctSentence(t);
  // 3) normalize whitespace and lower-case
  t = t.replace(/\s+/g, " ").trim().toLowerCase();
  return t;
}
