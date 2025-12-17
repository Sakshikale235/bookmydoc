// medicalContext.ts

export type AgeGroup =
  | "child"
  | "adolescent"
  | "adult"
  | "middle_aged"
  | "elderly";

export type BMICategory =
  | "underweight"
  | "normal"
  | "overweight"
  | "obese";

export interface MedicalContext {
  ageGroup: AgeGroup;
  bmi: number;
  bmiCategory: BMICategory;
  genderRisks: string[];
  climateRisks: string[];
  severityFlags: string[];
}
const CITY_RISK_MAP: Record<string, string[]> = {
  mumbai: ["dengue", "malaria", "fungal skin infection"],
  pune: ["respiratory allergy"],
  delhi: ["respiratory irritation", "allergy"],
  chennai: ["fungal skin infection", "heat rash"],
  kolkata: ["dengue", "malaria"],
  jaipur: ["dehydration", "heat rash", "skin irritation"],
  jodhpur: ["dehydration", "heat rash", "skin irritation"],
  udaipur: ["dehydration", "heat rash"],
};

export function buildMedicalContext(input: {
  age: number;
  gender: string;
  height: number; // cm
  weight: number; // kg
  location: string;
  symptoms: string[];
}): MedicalContext {
  // -----------------------------
  // AGE GROUP
  // -----------------------------
  let ageGroup: AgeGroup = "adult";

  if (input.age <= 12) ageGroup = "child";
  else if (input.age <= 18) ageGroup = "adolescent";
  else if (input.age <= 45) ageGroup = "adult";
  else if (input.age <= 60) ageGroup = "middle_aged";
  else ageGroup = "elderly";

  // -----------------------------
  // BMI
  // -----------------------------
  const heightMeters = input.height / 100;
  const bmi = Number(
    (input.weight / (heightMeters * heightMeters)).toFixed(1)
  );

  let bmiCategory: BMICategory = "normal";
  if (bmi < 18.5) bmiCategory = "underweight";
  else if (bmi < 25) bmiCategory = "normal";
  else if (bmi < 30) bmiCategory = "overweight";
  else bmiCategory = "obese";

  // -----------------------------
  // GENDER RISKS
  // -----------------------------
  const genderRisks: string[] = [];

  if (input.gender === "female") {
    genderRisks.push("anemia", "hormonal imbalance");
  }

  if (input.gender === "male") {
    genderRisks.push("cardiac risk");
  }

  // -----------------------------
  // CLIMATE RISKS (CITY-BASED)
  // -----------------------------
  const cityKey = input.location.toLowerCase();
  const climateRisks = CITY_RISK_MAP[cityKey] ?? [];

  // -----------------------------
  // SEVERITY FLAGS
  // -----------------------------
  const severityFlags: string[] = [];

  const symptomsText = input.symptoms.join(" ").toLowerCase();

  if (ageGroup === "elderly" && symptomsText.includes("chest")) {
    severityFlags.push("HIGH_CARDIAC_RISK");
  }

  if (bmiCategory === "obese" && symptomsText.includes("breath")) {
    severityFlags.push("CARDIO_RESPIRATORY_RISK");
  }

  if (ageGroup === "child" && symptomsText.includes("fever")) {
    severityFlags.push("PEDIATRIC_ALERT");
  }

  return {
    ageGroup,
    bmi,
    bmiCategory,
    genderRisks,
    climateRisks,
    severityFlags
  };
}
