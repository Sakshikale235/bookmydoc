const EMERGENCY_KEYWORDS = [
  "chest pain",
  "can't breathe",
  "cannot breathe",
  "not breathing",
  "difficulty breathing",
  "unconscious",
  "severe bleeding",
  "heart attack",
  "fainting",
  "loss of consciousness"
];

export function detectEmergency(text: string): boolean {
  const t = text.toLowerCase();
  return EMERGENCY_KEYWORDS.some((k) => t.includes(k));
}

export type Intent = "update_profile" | "book_appointment" | "report_symptom" | "emergency" | "other";

export function detectIntent(text: string, entities: any): Intent {
  const t = text.toLowerCase();

  // Emergency detection
  if (detectEmergency(text)) {
    return "emergency";
  }

  // Update profile intents
  if (/\b(update|change|edit)\b.*\b(details?|profile|info|information)\b/.test(t) ||
      /\b(update|change|edit)\b.*\b(age|gender|height|weight|blood|address|location)\b/.test(t)) {
    return "update_profile";
  }

  // Book appointment intents
  if (/\b(book|schedule|appointment|consult|see)\b.*\b(doctor|dr\.?|specialist)\b/.test(t) ||
      /\b(find|search|get)\b.*\b(doctor|dr\.?|specialist)\b/.test(t)) {
    return "book_appointment";
  }

  // Report symptom intents (if symptoms are present or symptom-related keywords)
  if (entities.symptoms && entities.symptoms.length > 0 ||
      /\b(i have|i'm having|i feel|feeling|suffering from|symptoms?|pain|ache|fever|cough|cold)\b/.test(t)) {
    return "report_symptom";
  }

  return "other";
}
