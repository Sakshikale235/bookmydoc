// keywordCorrection.ts
// Path fixed: generated dictionary lives at `src/data/medical_dictionary.json`
import DICT from "../../../../data/medical_dictionary.json";

type Buckets = Record<string, string[]>;

function buildBuckets(words: string[]): Buckets {
  const b: Buckets = {};
  for (const w of words) {
    const first = w && w[0] ? w[0].toLowerCase() : "#";
    if (!b[first]) b[first] = [];
    b[first].push(w);
  }
  return b;
}

// naive similarity using Levenshtein or simpler distance
function levenshtein(a: string, b: string): number {
  const dp: number[][] = Array(a.length + 1).fill(0).map(() => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(
        dp[i-1][j] + 1,
        dp[i][j-1] + 1,
        dp[i-1][j-1] + (a[i-1] === b[j-1] ? 0 : 1)
      );
    }
  }
  return dp[a.length][b.length];
}

const BUCKETS = buildBuckets(DICT as string[]);

// candidate set: words starting with same first letter + same length +/- 2
function getCandidates(token: string): string[] {
  const first = token[0] ? token[0].toLowerCase() : "#";
  const candidates = BUCKETS[first] || [];
  const len = token.length;
  return candidates.filter(c => Math.abs(c.length - len) <= 3);
}

export function correctWord(token: string, maxDistance = 2): string {
  if (!token) return token;
  token = token.toLowerCase();
  const candidates = getCandidates(token);
  let best = token;
  let bestScore = Infinity;
  for (const c of candidates) {
    const dist = levenshtein(token, c.toLowerCase());
    if (dist < bestScore) {
      bestScore = dist;
      best = c;
    }
  }
  return (bestScore <= maxDistance) ? best : token;
}

export function correctSentence(sentence: string): string {
  if (!sentence) return sentence;
  // word-split but keep punctuation- aware
  const tokens = sentence.split(/\s+/);
  const corrected = tokens.map(t => {
    // preserve numeric tokens (ages)
    if (/^\d+$/.test(t)) return t;
    // strip punctuation for matching, keep it for return
    const prefix = t.match(/^[^\w]*/)?.[0] || "";
    const suffix = t.match(/[^\w]*$/)?.[0] || "";
    const core = t.replace(/^[^\w]+|[^\w]+$/g, "");
    const correctedCore = correctWord(core) || core;
    return prefix + correctedCore + suffix;
  });
  return corrected.join(" ");
}

// phraseCorrections.ts
export const PHRASE_MAP: Record<string,string> = {
  "pain while peeing": "burning urination",
  "pain while urinating": "burning urination",
  "painful urination": "burning urination",
  "fever since morning": "fever",
  "fever since morninng": "fever",
  "runny nose and cough": "cold",
  "sore throat and fever": "pharyngitis",
  "breathless on exertion": "dyspnea on exertion",
  "vomiting and diarrhea": "gastroenteritis",
  "lower abdominal pain": "lower abdominal pain"
};
