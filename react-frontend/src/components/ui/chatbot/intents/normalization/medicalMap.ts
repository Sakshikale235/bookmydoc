// medicalMap.ts
export const medicalMap: Record<string, string> = {
  // Common misspellings
  "fevr": "fever",
  "feveeer": "fever",
  "feverr": "fever",
  "bukhar": "fever",
  "bukhaar": "fever",
  "kharash": "rash",
  "khasi": "cough",
  "sirdard": "headache",
  "pet dard": "stomach pain",
  "chakkar": "dizziness",
  "jukaam": "cold",

  // Medical terms
  "bp": "blood pressure",
  "high bp": "hypertension",
  "sugar": "blood sugar",
  "blood sugar": "diabetes",
  "chest pain": "cardiac pain",
  "fever": "fever" // Keep as fever for intent detection
};
