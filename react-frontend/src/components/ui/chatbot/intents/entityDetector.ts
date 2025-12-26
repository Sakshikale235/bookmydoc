// IMPROVED ENTITY DETECTOR (STEP 3)
// Uses: normalizeText(), correctWord(), PHRASE_MAP, validators, and fuzzy symptom matching.

import { normalizeText, correctWord, PHRASE_MAP } from "./keywordCorrection";
import {
  normalizeGender,
  validateSymptom,
  validateDuration,
  validateIntensity,
} from "./validators";

export type ExtractedEntities = {
  age?: number | null;
  gender?: string | null;
  height?: number | null;
  weight?: number | null;
  symptoms?: string[];
  duration?: string | null;
  intensity?: string | null;
  location?: string | null;
  raw: string;
};

// ----------------------------------------
// Regex Definitions
// ----------------------------------------
const AGE_REGEX = /\b(\d{1,2})\s*(year|years|yr|yrs|y)\b/i;

// Hinglish duration support added
const DURATION_REGEX =
  /\b(\d+)\s*(day|days|week|weeks|month|months|hour|hours|hr|hrs|din|mahine)\b/i;

const INTENSITY_WORDS = ["mild", "moderate", "severe", "slight", "sharp", "dull"];

const LOCATION_REGEX = /\bin\s+([a-zA-Z0-9\s,]+)/i;

// Unified symptom list (base dictionary)
const SYMPTOM_KEYWORDS = [
  "fever",
  "cold",
  "cough",
  "headache",
  "migraine",
  "pain",
  "abdominal pain",
  "stomach pain",
  "burning urination",
  "vomiting",
  "nausea",
  "diarrhea",
  "chills",
  "itching",
  "rash",
  "dry skin",
  "fatigue",
  "dizziness",
  "sore throat",
  "breathlessness",
  "shortness of breath",
];

// ----------------------------------------
// MAIN EXTRACTOR
// ----------------------------------------
export function extractEntities(rawMessage: string): ExtractedEntities {
  if (!rawMessage || rawMessage.trim() === "") {
    return { raw: rawMessage };
  }

  // 1. Use the already normalized text passed from processChatMessage
  const text = rawMessage;

  // ----------------------------------------
  // AGE
  // ----------------------------------------
  let age: number | null = null;
  const ageMatch = text.match(AGE_REGEX);
  if (ageMatch) {
    age = parseInt(ageMatch[1]);
    if (age < 1 || age > 119) age = null;
  }

  // ----------------------------------------
  // GENDER (normalized: m → male, f → female, etc.)
  // ----------------------------------------
  let gender: string | null = normalizeGender(text);

  // ----------------------------------------
  // DURATION ("2 days", "3 din", "1 week")
  // ----------------------------------------
  let duration: string | null = null;
  const durationMatch = text.match(DURATION_REGEX);
  if (durationMatch) {
    const d = durationMatch[0].trim();
    if (validateDuration(d)) duration = d;
  }

  // ----------------------------------------
  // INTENSITY ("mild", "severe", "sharp pain")
  // ----------------------------------------
  let intensity: string | null = null;
  for (const i of INTENSITY_WORDS) {
    if (text.includes(i)) {
      if (validateIntensity(i)) intensity = i;
      break;
    }
  }

  // ----------------------------------------
  // HEIGHT ("170 cm", "5'10 inches", "170 centimeters")
  // ----------------------------------------
  let height: number | null = null;
  const heightRegex = /\b(\d{1,3})\s*(?:cm|centimeters?|inches?|in|'|ft|feet)\b/i;
  const heightMatch = text.match(heightRegex);
  if (heightMatch) {
    height = parseInt(heightMatch[1]);
    if (height < 30 || height > 300) height = null;
  }

  // ----------------------------------------
  // WEIGHT ("60 kg", "150 pounds", "60 kilograms")
  // ----------------------------------------
  let weight: number | null = null;
  const weightRegex = /\b(\d{1,3})\s*(?:kg|kilograms?|pounds?|lbs?|kgs?)\b/i;
  const weightMatch = text.match(weightRegex);
  if (weightMatch) {
    weight = parseInt(weightMatch[1]);
    if (weight < 2 || weight > 600) weight = null;
  }

  // ----------------------------------------
  // LOCATION ("in Mumbai", "in Delhi sector 15")
  // ----------------------------------------
  let location: string | null = null;
  const locMatch = text.match(LOCATION_REGEX);
  if (locMatch) {
    location = locMatch[1].trim();
  }

  // ----------------------------------------
  // SYMPTOMS — multiword + fuzzy + corrected
  // ----------------------------------------
  const symptoms = extractSymptoms(text);

  return {
    age,
    gender,
    duration,
    intensity,
    location,
    symptoms: symptoms.length ? symptoms : undefined,
    raw: rawMessage,
  };
}

// ----------------------------------------
// SYMPTOM LOGIC
// ----------------------------------------
function extractSymptoms(text: string): string[] {
  const tokens = text.split(/\s+/);

  const detected = new Set<string>();

  // 1. Multiword symptoms from phrase map
  for (const phrase in PHRASE_MAP) {
    if (text.includes(phrase)) {
      detected.add(PHRASE_MAP[phrase]);
    }
  }

  // 2. Check 1-word and 2-word tokens
  for (let i = 0; i < tokens.length; i++) {
    const one = correctWord(tokens[i]);

    // Single token symptoms
    if (SYMPTOM_KEYWORDS.includes(one)) {
      detected.add(one);
    }

    // Pair token symptoms
    if (i < tokens.length - 1) {
      const two = `${one} ${correctWord(tokens[i + 1])}`;
      if (SYMPTOM_KEYWORDS.includes(two)) detected.add(two);
    }
  }

  // 3. Remove non-symptoms + keep validated ones
  return Array.from(detected)
    .map((s) => s.trim())
    .filter((s) => validateSymptom(s));
}
