// src/components/ui/chatbot/validators.ts

/**
 * This module standardizes all validation logic used by:
 * - step manager
 * - entity detector
 * - profile update flow
 * - backend payload builder
 *
 * Supports string inputs (raw user messages) AND
 * typed values (numbers from entity extraction).
 */

// -------------------------
// BASIC NUMBER VALIDATORS
// -------------------------
export const validateAge = (val: any): boolean => {
  const num = parseInt(val);
  return Number.isInteger(num) && num >= 1 && num <= 119;
};

export const validateHeight = (val: any): boolean => {
  const num = parseFloat(val);
  return !isNaN(num) && num >= 30 && num <= 300;
};

export const validateWeight = (val: any): boolean => {
  const num = parseFloat(val);
  return !isNaN(num) && num >= 2 && num <= 600;
};

// -------------------------
// GENDER NORMALIZATION + VALIDATION
// -------------------------
export function normalizeGender(raw: string | null): string | null {
  if (!raw) return null;
  const t = raw.toLowerCase().trim();

  const MAP: Record<string, string> = {
    m: "male",
    ma: "male",
    mal: "male",
    male: "male",
    maale: "male",
    mael: "male",
    mle: "male",
    ladka: "male",
    boy: "male",

    f: "female",
    fe: "female",
    fem: "female",
    femal: "female",
    female: "female",
    femail: "female",
    femle: "female",
    ladki: "female",
    girl: "female",

    trans: "trans",
    transgender: "trans",
  };

  return MAP[t] || null;
}


export function validateGender(val: any): boolean {
  const g = normalizeGender(val);
  if (!g) return false;
  return ["male", "female", "trans"].includes(g);
}

// -------------------------
// BLOOD GROUP VALIDATION
// -------------------------
export function validateBloodGroup(val: any): boolean {
  if (!val) return false;
  return ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].includes(
    val.toUpperCase()
  );
}

// -------------------------
// LOCATION / ADDRESS
// -------------------------
export const validateLocation = (val: any): boolean => {
  if (!val) return false;
  return val.toString().trim().length >= 3;
};

// -------------------------
// SYMPTOM VALIDATION
// -------------------------
export const validateSymptom = (sym: string): boolean => {
  if (!sym) return false;
  return sym.trim().length >= 3;
};

/**
 * Ensures symptom arrays are valid:
 * ["fever", "cold"] → OK
 */
export const validateSymptomArray = (arr: any): boolean => {
  if (!Array.isArray(arr)) return false;
  return arr.every((s) => validateSymptom(s));
};

// -------------------------
// DURATION VALIDATION ("2 days", "1 week", etc.)
// -------------------------
export const validateDuration = (val: any): boolean => {
  if (!val) return false;
  return /\b\d+\s*(day|days|week|weeks|month|months|hr|hrs|hour|hours)\b/i.test(
    val.toString()
  );
};

// -------------------------
// INTENSITY ("mild", "moderate", "severe", etc.)
// -------------------------
export const validateIntensity = (val: any): boolean => {
  if (!val) return false;
  const t = val.toString().toLowerCase();
  return ["mild", "moderate", "severe", "slight", "sharp", "dull"].includes(t);
};

// -------------------------
// MASTER VALIDATOR OBJECT
// Used in steps.ts + profile update logic
// -------------------------
export const validators: any = {
  age: validateAge,
  gender: validateGender,
  height: validateHeight,
  weight: validateWeight,
  blood_group: validateBloodGroup,
  address: validateLocation,
  location: validateLocation,
  duration: validateDuration,
  intensity: validateIntensity,
  symptoms: (val: any) => {
    if (Array.isArray(val)) return validateSymptomArray(val);
    return validateSymptom(val);
  },
};

// -------------------------
// Validate full userInfo (before backend)
// -------------------------
export function validateAll(info: any): string[] {
  const errors: string[] = [];

  if (info.age && !validateAge(info.age)) errors.push("Invalid age");

  if (info.gender && !validateGender(info.gender))
    errors.push("Invalid gender");

  if (info.height && !validateHeight(info.height))
    errors.push("Invalid height");

  if (info.weight && !validateWeight(info.weight))
    errors.push("Invalid weight");

  if (info.blood_group && !validateBloodGroup(info.blood_group))
    errors.push("Invalid blood group");

  if (info.location && !validateLocation(info.location))
    errors.push("Invalid location");

  if (info.symptoms && !validateSymptomArray(info.symptoms))
    errors.push("Invalid symptoms");

  return errors;
}
