// entityDetector.ts
import { correctSentence, correctWord, PHRASE_MAP } from "./keywordCorrection";
// import { PHRASE_MAP } from "./phraseCorrections";

type Extracted = {
  age?: number | null;
  gender?: string | null;
  symptoms?: string[];
  duration?: string | null;
  intensity?: string | null;
  location?: string | null;
  raw?: string;
};

const GENDER_WORDS = ["male","female","trans","non-binary","other"];
const DURATION_REGEX = /\b(\d+)\s*(days?|day|weeks?|week|months?|month|hrs|hours?)\b/i;
const AGE_REGEX = /\b(\d{1,2})\s*(years?|yrs|yr|y)\b/i;
const INTENSITY_WORDS = ["mild","moderate","severe","slight","sharp","dull"];

function applyPhraseMap(text: string) {
  const t = text.toLowerCase();
  // longest-first replacement
  const keys = Object.keys(PHRASE_MAP).sort((a,b) => b.length - a.length);
  let out = t;
  for (const k of keys) {
    if (out.includes(k)) out = out.replace(new RegExp(k, "g"), PHRASE_MAP[k]);
  }
  return out;
}

export function extractEntities(message: string): Extracted {
  if (!message) return { raw: message };

  // 1) phrase normalize
  let text = applyPhraseMap(message);

  // 2) typo-correct the sentence (preserves numbers)
  text = correctSentence(text);

  // 3) extract age
  const ageMatch = text.match(AGE_REGEX);
  const age = ageMatch ? parseInt(ageMatch[1], 10) : undefined;

  // 4) extract duration
  const durMatch = text.match(DURATION_REGEX);
  const duration = durMatch ? durMatch[0] : undefined;

  // 5) detect genders (prefer explicit words)
  let gender: string | undefined;
  for (const g of GENDER_WORDS) {
    if (text.includes(g)) {
      gender = g;
      break;
    }
  }

  // 6) detect symptoms: pick tokens that are in dictionary or common symptom patterns
  // We will split, filter stopwords, and check corrected tokens against dictionary buckets (via correctWord)
  const tokens = text.split(/\s+/).map(t => t.replace(/[^\w-]/g,"").toLowerCase()).filter(Boolean);
  const symptomCandidates = new Set<string>();
  const symptomKeywords = ["fever","cough","cold","burning","pain","headache","vomiting","nausea","diarrhea","dizziness","chills","sore","throat","urinary","frequency","urine","bleeding","rash","itching","shortness","breath","palpitation","anxiety","fatigue"];

  for (let i = 0; i < tokens.length; i++) {
    // check 2-gram (phrase) too
    const two = tokens[i] && tokens[i+1] ? `${tokens[i]} ${tokens[i+1]}` : null;
    if (two && symptomKeywords.some(k => two.includes(k))) symptomCandidates.add(two);
    const t = tokens[i];
    if (symptomKeywords.some(k => t.includes(k))) symptomCandidates.add(t);
    // also run correction and check full match
    const corr = correctWord(t);
    if (symptomKeywords.some(k => corr.includes(k))) symptomCandidates.add(corr);
  }

  // Assemble symptoms array
  const symptoms = Array.from(symptomCandidates).map(s => s.replace(/_+/g," ").trim());

  // 7) intensity detection
  let intensity: string | undefined;
  for (const intW of INTENSITY_WORDS) if (text.includes(intW)) { intensity = intW; break; }

  // 8) location extraction (simple "in <place>" or after address)
  let location: string | undefined;
  const locMatch = text.match(/\bin\s+([a-zA-Z0-9\s,]+)/i);
  if (locMatch) location = locMatch[1].trim();

  return {
    age: age ?? null,
    gender: gender ?? null,
    symptoms: symptoms.length ? symptoms : undefined,
    duration: duration ?? null,
    intensity: intensity ?? null,
    location: location ?? null,
    raw: message
  };
}
