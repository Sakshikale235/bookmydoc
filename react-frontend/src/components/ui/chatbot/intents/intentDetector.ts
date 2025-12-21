// intentDetector.ts

import { NormalizedInput } from "./normalization/types";
import { ExtractedEntities } from "./entityDetector";

// ----------------------------------------------
// INTENT TYPES
// ----------------------------------------------
export type IntentType =
  | "emergency"
  | "update_profile"
  | "book_appointment"
  | "report_symptom"
  | "greeting"
  | "yes"
  | "no"
  | "thanks"
  | "other";

export type DetectedIntent = {
  type: IntentType;
  confidence: number;
  targets?: string[];
};

// ----------------------------------------------
// KEYWORD GROUPS (CANONICAL ONLY)
// ----------------------------------------------
const EMERGENCY_PHRASES = [
  "chest pain",
  "shortness of breath",
  "cannot breathe",
  "difficulty breathing",
  "unconscious",
  "loss of consciousness",
  "heart attack"
];

const GREETINGS = ["hi", "hello", "hey", "good morning", "good evening"];

const YES_WORDS = ["yes", "ok", "okay", "sure"];
const NO_WORDS = ["no", "not", "never"];

const THANKS_WORDS = ["thanks", "thank you", "thankyou", "thx"];

const PROFILE_FIELDS = [
  "age",
  "gender",
  "height",
  "weight",
  "blood group",
  "address",
  "location"
];

const PROFILE_ACTIONS = ["update", "change", "edit", "modify"];

const APPOINTMENT_WORDS = [
  "book_appointment",
  "appointment",
  "consult",
  "specialist",
  "doctor"
];

const SPECIALISTS = [
  "dermatologist",
  "cardiologist",
  "orthopedic",
  "ophthalmologist",
  "general physician",
  "gynecologist"
];


// ----------------------------------------------
// MAIN FUNCTION
// ----------------------------------------------
export function detectIntent(
  normalized: NormalizedInput,
  entities: ExtractedEntities
): DetectedIntent {

  // -----------------------------
  // NORMALIZED TEXT (SINGLE SOURCE)
  // -----------------------------
  const text =
    normalized.normalizedText ||
    normalized.cleanedText ||
    normalized.rawText;

  const words = text.split(/\s+/);

  // -----------------------------
  // STRONG SYMPTOM INTENT CHECK (using normalized text)
  // -----------------------------
  const symptomKeywords = [
    "fever",
    "cold",
    "cough",
    "pain",
    "headache",
    "vomiting",
    "diarrhea",
    "nausea",
    "bp",
    "blood pressure",
    "sugar",
    "bukhar", // Hinglish
    "kharash", // rash
    "khasi", // cough
    "sirdard", // headache
    "pet dard", // stomach pain
    "chakkar", // dizziness
    "jukaam", // cold
    "kharash" // rash
  ];

  if (symptomKeywords.some(word => text.includes(word))) {
    return {
      type: "report_symptom",
      confidence: 0.9
    };
  }

  // -----------------------------
  // 1. Emergency — highest priority
  // -----------------------------
  for (const phrase of EMERGENCY_PHRASES) {
    if (text.includes(phrase)) {
      return { type: "emergency", confidence: 1.0 };
    }
  }

  // -----------------------------
  // 2. Yes / No
  // -----------------------------
  if (words.length <= 2) {
    if (words.some(w => YES_WORDS.includes(w))) {
      return { type: "yes", confidence: 0.95 };
    }
    if (words.some(w => NO_WORDS.includes(w))) {
      return { type: "no", confidence: 0.95 };
    }
  }

  // -----------------------------
  // 3. Greeting
  // -----------------------------
  if (GREETINGS.some(g => text.startsWith(g))) {
    return { type: "greeting", confidence: 0.9 };
  }

  // -----------------------------
  // 3.5 Thanks
  // -----------------------------
  if (words.length <= 3 && THANKS_WORDS.some(t => text.includes(t))) {
    return { type: "thanks", confidence: 0.9 };
  }

  // -----------------------------
// 4. SYMPTOM INTENT (HIGH PRIORITY)
// -----------------------------

if (
  symptomKeywords.some(word => text.includes(word)) ||
  entities?.symptoms?.length
) {
  return {
    type: "report_symptom",
    confidence: 0.9
  };
}

// -----------------------------
// 5. Update profile (LOWER PRIORITY)
// -----------------------------
const hasAction = PROFILE_ACTIONS.some(a => text.includes(a));
const matchedFields = PROFILE_FIELDS.filter(f => text.includes(f));

if (hasAction || matchedFields.length > 0) {
  return {
    type: "update_profile",
    confidence: 0.85,
    targets: matchedFields.length ? matchedFields : undefined
  };
}

  // -----------------------------
  // 5. Book appointment
  // -----------------------------
  if (APPOINTMENT_WORDS.some(w => text.includes(w))) {
    return { type: "book_appointment", confidence: 0.85 };
  }

  // 5.5 Specialist mentioned
  if (SPECIALISTS.some(s => text.includes(s))) {
    return { type: "book_appointment", confidence: 0.75 };
  }

  // -----------------------------
  // 6. Entity-driven symptom
  // -----------------------------
  if (entities?.symptoms?.length) {
    return { type: "report_symptom", confidence: 0.9 };
  }

  // -----------------------------
  // 7. Keyword fallback
  // -----------------------------
  if (
    text.includes("pain") ||
    text.includes("fever") ||
    text.includes("cough")
  ) {
    return { type: "report_symptom", confidence: 0.75 };
  }

  // -----------------------------
  // 8. Fallback
  // -----------------------------
  return { type: "other", confidence: 0.3 };
}

