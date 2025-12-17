// spellCorrector.ts
const STOP_WORDS = new Set([
  "mujhe", "mujh", "hai", "ha", "ho",
  "chahiye", "batao", "dikhao",
  "problem", "issue",
  "male", "female", "man", "woman",
  "me", "my", "i", "you",
  "skin", "heart", "bone", "eye"
]);

const KNOWN_WORDS = [
  // profile fields
  "age", "gender", "height", "weight",

  // specialists (DB-aligned)
  "dermatologist",
  "cardiologist",
  "orthopedic",
  "ophthalmologist",
  "general physician",

  // medical conditions
  "diabetes",
  "hypertension",
  "fever",
  "pain"
];

function editDistance(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, () =>
    Array(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }

  return dp[a.length][b.length];
}

export function correctSpelling(token: string): string | null {
  // ⬇️ ADD THESE TWO LINES AT THE VERY START
  if (token.length <= 3) return null;
  if (STOP_WORDS.has(token)) return null;

  let bestMatch: string | null = null;
  let minDistance = Infinity;

  for (const word of KNOWN_WORDS) {
    const dist = editDistance(token, word);
    if (dist < minDistance && dist <= 2) {
      minDistance = dist;
      bestMatch = word;
    }
  }

  return bestMatch;
}
