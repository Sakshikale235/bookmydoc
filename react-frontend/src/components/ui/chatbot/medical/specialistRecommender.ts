// specialistRecommender.ts
import { DiseaseRisk } from "./diseaseRiskEvaluator";

export type RecommendationConfidence = "low" | "medium" | "high";

export interface SpecialistRecommendation {
  specialist: string;
  confidence: RecommendationConfidence;
  reason: string;
}

const DISEASE_SPECIALIST_MAP: Record<string, string> = {
  "heart disease": "cardiologist",
  "respiratory infection": "pulmonologist",
  "skin infection": "dermatologist",
  "allergy": "dermatologist",
  "dengue": "general physician",
  "viral infection": "general physician",
  "anemia": "general physician",
  "arthritis": "orthopedic"
};

export function recommendSpecialist(
  diseaseRisks: DiseaseRisk[]
): SpecialistRecommendation {

  // 1. Sort risks by priority
  const priority = { low: 1, medium: 2, high: 3 };
  const sorted = [...diseaseRisks].sort(
    (a, b) => priority[b.risk] - priority[a.risk]
  );

  // 2. Take highest-risk condition
  const top = sorted[0];

  // 3. Map disease → specialist
  const specialist =
    DISEASE_SPECIALIST_MAP[top.condition] ?? "general physician";

  // 4. Confidence mapping
  let confidence: RecommendationConfidence = "medium";
  if (top.risk === "high") confidence = "high";
  else if (top.risk === "low") confidence = "low";

  return {
    specialist,
    confidence,
    reason: `Recommended based on ${top.condition} (${top.risk} risk)`
  };
}

