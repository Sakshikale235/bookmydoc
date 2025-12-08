export interface SymptomAnalysisResponse {
  advice: string;
  severity: string;
  possible_diseases: string[];
  recommended_doctors: any[];
}
