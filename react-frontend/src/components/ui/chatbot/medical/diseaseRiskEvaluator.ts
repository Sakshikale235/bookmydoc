// diseaseRiskEvaluator.ts
import { MedicalContext } from "./medicalContext";

export type RiskLevel = "low" | "medium" | "high";

export interface DiseaseRisk {
  condition: string;
  risk: RiskLevel;
  reason: string;
}
const SYMPTOM_DISEASE_MAP: Record<string, string[]> = {
  "chest pain": ["heart disease"],
  "breathlessness": ["heart disease", "respiratory infection"],
  "fever": ["viral infection", "dengue"],
  "itching": ["skin infection", "allergy"],
  "skin rash": ["skin infection", "allergy"],
  "joint pain": ["arthritis"],
  "fatigue": ["anemia", "metabolic disorder"]
};

export function evaluateDiseaseRisk(
  medicalContext: MedicalContext,
  symptoms: string[]
): DiseaseRisk[] {

  const results: DiseaseRisk[] = [];
  const symptomsText = symptoms.join(" ").toLowerCase();

  // Helper to add or upgrade risk
  function addRisk(
    condition: string,
    risk: RiskLevel,
    reason: string
  ) {
    const existing = results.find(r => r.condition === condition);

    if (!existing) {
      results.push({ condition, risk, reason });
    } else {
      // upgrade risk if higher
      const priority = { low: 1, medium: 2, high: 3 };
      if (priority[risk] > priority[existing.risk]) {
        existing.risk = risk;
        existing.reason = reason;
      }
    }
  }

  // -----------------------------
  // SYMPTOM-BASED RULES
  // -----------------------------
  for (const symptom in SYMPTOM_DISEASE_MAP) {
    if (symptomsText.includes(symptom)) {
      for (const disease of SYMPTOM_DISEASE_MAP[symptom]) {
        addRisk(disease, "medium", `Symptom "${symptom}" reported`);
      }
    }
  }

  // -----------------------------
  // CONTEXT-BASED ESCALATION
  // -----------------------------

  // Elderly + cardiac flag
  if (
    medicalContext.ageGroup === "elderly" &&
    medicalContext.severityFlags.includes("HIGH_CARDIAC_RISK")
  ) {
    addRisk(
      "heart disease",
      "high",
      "Elderly patient with cardiac risk indicators"
    );
  }

  // Obesity + breathlessness
  if (
    medicalContext.bmiCategory === "obese" &&
    symptomsText.includes("breath")
  ) {
    addRisk(
      "heart disease",
      "high",
      "Obesity with breathing difficulty"
    );
  }

  // Climate-based diseases
  if (
    medicalContext.climateRisks.includes("dengue") &&
    symptomsText.includes("fever")
  ) {
    addRisk(
      "dengue",
      "medium",
      "Fever in dengue-prone region"
    );
  }

  // Gender-based
  if (
    medicalContext.genderRisks.includes("anemia") &&
    symptomsText.includes("fatigue")
  ) {
    addRisk(
      "anemia",
      "medium",
      "Fatigue with anemia risk factors"
    );
  }

  return results;
}

