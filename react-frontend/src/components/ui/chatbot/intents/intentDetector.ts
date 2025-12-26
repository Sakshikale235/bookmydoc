// intentDetector.ts

import { NormalizedInput } from "./normalization/types";
import { ExtractedEntities } from "./entityDetector";
import { medicalMap } from "./normalization/medicalMap";

// ----------------------------------------------
// INTENT TYPES
// ----------------------------------------------
export type IntentType =
  | "emergency"
  | "update_profile"
  | "book_appointment"
  | "report_symptom"
  | "report_disease"
  | "consult_doctor"
  | "greeting"
  | "yes"
  | "no"
  | "thanks"
  | "stop"
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

const STOP_WORDS = ["stop", "cancel", "quit", "exit", "end", "abort"];

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

const CONSULT_DOCTOR_WORDS = [
  "consult doctor",
  "find doctor",
  "see doctor",
  "talk to doctor",
  "speak to doctor",
  "doctor consultation",
  "medical consultation",
  "get help",
  "need help",
  "help me"
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
  // STRONG SYMPTOM INTENT CHECK (using cleaned text to avoid normalization issues)
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
    "kharash", // rash
    "rash" // added to catch skin rash
  ];

  if (symptomKeywords.some(word => normalized.cleanedText.includes(word))) {
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
  // 1.5 Disease detection — high priority
  // -----------------------------
  const diseaseKeywords = [
    "asthma",
    "sinusitis",
    "sinus",
    "diabetes",
    "hypertension",
    "hypotension",
    "anemia",
    "arthritis",
    "osteoporosis",
    "gout",
    "fibromyalgia",
    "ibs",
    "irritable bowel syndrome",
    "crohn's disease",
    "ulcerative colitis",
    "hepatitis",
    "cirrhosis",
    "pancreatitis",
    "tuberculosis",
    "pneumonia",
    "bronchitis",
    "copd",
    "emphysema",
    "pleural effusion",
    "pneumothorax",
    "hemothorax",
    "pulmonary embolism",
    "deep vein thrombosis",
    "dvt",
    "myocardial infarction",
    "heart attack",
    "angina",
    "atrial fibrillation",
    "afib",
    "congestive heart failure",
    "chf",
    "peripheral artery disease",
    "pad",
    "stroke",
    "cerebral infarction",
    "transient ischemic attack",
    "tia",
    "mini stroke",
    "epilepsy",
    "seizure",
    "parkinson's disease",
    "parkinson",
    "multiple sclerosis",
    "ms",
    "alzheimer's disease",
    "dementia",
    "systemic lupus erythematosus",
    "sle",
    "lupus",
    "scleroderma",
    "sjogren's syndrome",
    "sjogren",
    "ankylosing spondylitis",
    "psoriatic arthritis",
    "gouty arthritis",
    "nephrotic syndrome",
    "acute kidney injury",
    "aki",
    "chronic kidney disease",
    "ckd",
    "end stage renal disease",
    "esrd",
    "polycystic kidney disease",
    "pkd",
    "nephrolithiasis",
    "urolithiasis",
    "cholelithiasis",
    "choledocholithiasis",
    "celiac disease",
    "gluten intolerance",
    "inflammatory bowel disease",
    "ibd",
    "diverticulitis",
    "diverticulosis",
    "hemorrhoids",
    "piles",
    "anal fissure",
    "fistula",
    "rectal prolapse",
    "colorectal cancer",
    "colon cancer",
    "rectal cancer",
    "esophageal cancer",
    "stomach cancer",
    "pancreatic cancer",
    "liver cancer",
    "hepatocellular carcinoma",
    "gallbladder cancer",
    "breast cancer",
    "lung cancer",
    "prostate cancer",
    "bladder cancer",
    "kidney cancer",
    "ovarian cancer",
    "cervical cancer",
    "endometrial cancer",
    "thyroid cancer",
    "melanoma",
    "basal cell carcinoma",
    "skin cancer",
    "squamous cell carcinoma",
    "leukemia",
    "lymphoma",
    "multiple myeloma",
    "myeloma",
    "acute myeloid leukemia",
    "aml",
    "acute lymphoblastic leukemia",
    "all",
    "chronic myeloid leukemia",
    "cml",
    "chronic lymphocytic leukemia",
    "cll",
    "hodgkin's lymphoma",
    "non-hodgkin's lymphoma",
    "thrombocytopenia",
    "thrombocytosis",
    "neutropenia",
    "leukopenia",
    "leukocytosis",
    "eosinophilia",
    "monocytosis",
    "lymphocytosis",
    "aplastic anemia",
    "thalassemia",
    "sickle cell anemia",
    "hemophilia",
    "von willebrand disease",
    "idiopathic thrombocytopenic purpura",
    "itp",
    "disseminated intravascular coagulation",
    "dic",
    "thrombotic thrombocytopenic purpura",
    "ttp",
    "hemolytic uremic syndrome",
    "hus",
    "autoimmune hemolytic anemia",
    "hypersplenism",
    "polycythemia vera",
    "essential thrombocythemia",
    "primary myelofibrosis",
    "chronic myelomonocytic leukemia",
    "cmml",
    "myelodysplastic syndrome",
    "mds",
    "acute promyelocytic leukemia",
    "apl",
    "juvenile myelomonocytic leukemia",
    "jmml",
    "transient myeloproliferative disorder",
    "down syndrome associated leukemia",
    "diamond-blackfan anemia",
    "fanconi anemia",
    "shwachman-diamond syndrome",
    "congenital dyserythropoietic anemia",
    "hereditary spherocytosis",
    "hereditary elliptocytosis",
    "glucose-6-phosphate dehydrogenase deficiency",
    "g6pd deficiency",
    "pyruvate kinase deficiency",
    "congenital erythropoietic porphyria",
    "erythropoietic protoporphyria",
    "acute intermittent porphyria",
    "variegate porphyria",
    "hereditary coproporphyria",
    "porphyria cutanea tarda",
    "hepatoerythropoetic porphyria",
    "x-linked protoporphyria",
    "alagille syndrome",
    "alpha-1 antitrypsin deficiency",
    "cystic fibrosis",
    "cf",
    "primary ciliary dyskinesia",
    "kartagener syndrome",
    "surfactant protein deficiency",
    "neonatal respiratory distress syndrome",
    "nrds",
    "bronchopulmonary dysplasia",
    "bpd",
    "meconium aspiration syndrome",
    "persistent pulmonary hypertension of the newborn",
    "pphn",
    "congenital diaphragmatic hernia",
    "cdh",
    "omphalocele",
    "gastroschisis",
    "esophageal atresia",
    "tracheoesophageal fistula",
    "tef",
    "duodenal atresia",
    "jejunal atresia",
    "ileal atresia",
    "meconium ileus",
    "necrotizing enterocolitis",
    "nec",
    "short bowel syndrome",
    "intestinal malrotation",
    "hirschsprung disease",
    "imperforate anus",
    "anorectal malformation",
    "biliary atresia",
    "choledochal cyst",
    "alcoholic liver disease",
    "non-alcoholic fatty liver disease",
    "nafld",
    "non-alcoholic steatohepatitis",
    "nash",
    "primary biliary cirrhosis",
    "pbc",
    "primary sclerosing cholangitis",
    "psc",
    "autoimmune hepatitis",
    "aih",
    "wilson disease",
    "hemochromatosis",
    "glycogen storage disease",
    "galactosemia",
    "fructose intolerance",
    "hereditary fructose intolerance",
    "tyrosinemia",
    "maple syrup urine disease",
    "msud",
    "phenylketonuria",
    "pku",
    "homocystinuria",
    "cystinuria",
    "hartnup disease",
    "cystinosis",
    "fanconi syndrome",
    "bartter syndrome",
    "gitelman syndrome",
    "liddle syndrome",
    "pseudohypoaldosteronism",
    "diabetes insipidus",
    "nephrogenic diabetes insipidus",
    "central diabetes insipidus",
    "syndrome of inappropriate antidiuretic hormone",
    "siadh",
    "adrenal insufficiency",
    "addison disease",
    "cushing syndrome",
    "congenital adrenal hyperplasia",
    "cah",
    "pheochromocytoma",
    "neuroblastoma",
    "retinoblastoma",
    "wilms tumor",
    "hepatoblastoma",
    "medulloblastoma",
    "ependymoma",
    "pilocytic astrocytoma",
    "glioblastoma",
    "gbm",
    "oligodendroglioma",
    "meningioma",
    "pituitary adenoma",
    "craniopharyngioma",
    "acoustic neuroma",
    "vestibular schwannoma",
    "meningocele",
    "myelomeningocele",
    "encephalocele",
    "hydrocephalus",
    "dandy-walker syndrome",
    "chiari malformation",
    "syringomyelia",
    "tethered cord syndrome",
    "spina bifida",
    "anencephaly",
    "holoprosencephaly",
    "agenesis of the corpus callosum",
    "lissencephaly",
    "polymicrogyria",
    "schizencephaly",
    "porencephaly",
    "arachnoid cyst",
    "pineal cyst",
    "colloid cyst",
    "epidermoid cyst",
    "dermoid cyst",
    "prolactinoma",
    "cushing disease",
    "acromegaly",
    "type 1 diabetes mellitus",
    "type 2 diabetes mellitus",
    "gestational diabetes",
    "diabetic ketoacidosis",
    "dka",
    "hyperosmolar hyperglycemic state",
    "hhs",
    "diabetic neuropathy",
    "diabetic retinopathy",
    "diabetic nephropathy",
    "diabetic foot",
    "hypoglycemia",
    "insulin resistance",
    "metabolic syndrome",
    "polycystic ovary syndrome",
    "pcos",
    "endometriosis",
    "adenomyosis",
    "uterine fibroids",
    "leiomyoma",
    "ovarian cyst",
    "endometrial hyperplasia",
    "premature ovarian failure",
    "premature menopause",
    "menopause",
    "perimenopause",
    "postmenopause",
    "dysmenorrhea",
    "amenorrhea",
    "oligomenorrhea",
    "polymenorrhea",
    "menorrhagia",
    "metrorrhagia",
    "postmenopausal bleeding",
    "pelvic inflammatory disease",
    "pid",
    "uterine prolapse",
    "cervical insufficiency",
    "incompetent cervix",
    "placenta previa",
    "placental abruption",
    "preeclampsia",
    "eclampsia",
    "gestational hypertension",
    "hyperemesis gravidarum",
    "ectopic pregnancy",
    "molar pregnancy",
    "miscarriage",
    "spontaneous abortion",
    "stillbirth",
    "intrauterine growth restriction",
    "iugr",
    "preterm labor",
    "preterm birth",
    "postpartum hemorrhage",
    "retained placenta",
    "puerperal infection",
    "mastitis",
    "breast engorgement",
    "postpartum depression",
    "postpartum thyroiditis",
    "sheehan syndrome",
    "peripartum cardiomyopathy",
    "amniotic fluid embolism",
    "venous thromboembolism",
    "vte",
    "cerebral venous thrombosis",
    "ovarian vein thrombosis",
    "vulvar cancer",
    "vaginal cancer",
    "gestational trophoblastic disease",
    "choriocarcinoma",
    "fibroadenoma",
    "breast cyst",
    "intraductal papilloma",
    "phyllodes tumor",
    "ductal carcinoma in situ",
    "dcis",
    "invasive ductal carcinoma",
    "invasive lobular carcinoma",
    "triple negative breast cancer",
    "her2 positive breast cancer",
    "hormone receptor positive breast cancer",
    "prostatitis",
    "epididymitis",
    "orchitis",
    "testicular torsion",
    "varicocele",
    "hydrocele",
    "spermatocoele",
    "inguinal hernia",
    "femoral hernia",
    "umbilical hernia",
    "incisional hernia",
    "hiatal hernia",
    "diaphragmatic hernia",
    "sports hernia",
    "obesity",
    "overweight",
    "underweight",
    "eating disorder",
    "anorexia nervosa",
    "bulimia nervosa",
    "binge eating disorder",
    "pica",
    "rumination disorder",
    "avoidant restrictive food intake disorder",
    "arfid",
    "cachexia",
    "sarcopenia",
    "osteomalacia",
    "rickets",
    "vitamin d deficiency",
    "calcium deficiency",
    "iron deficiency",
    "vitamin b12 deficiency",
    "folate deficiency",
    "zinc deficiency",
    "copper deficiency",
    "selenium deficiency",
    "iodine deficiency",
    "magnesium deficiency",
    "potassium deficiency",
    "sodium excess",
    "hypernatremia",
    "hyponatremia",
    "hyperkalemia",
    "hypokalemia",
    "hypercalcemia",
    "hypocalcemia",
    "hypermagnesemia",
    "hypomagnesemia",
    "metabolic acidosis",
    "metabolic alkalosis",
    "respiratory acidosis",
    "respiratory alkalosis",
    "lactic acidosis",
    "starvation ketoacidosis",
    "alcoholic ketoacidosis",
    "acid-base imbalance",
    "fluid overload",
    "hypervolemia",
    "dehydration",
    "hypovolemia",
    "shock",
    "hypovolemic shock",
    "cardiogenic shock",
    "distributive shock",
    "septic shock",
    "anaphylactic shock",
    "neurogenic shock",
    "obstructive shock",
    "multiple organ dysfunction syndrome",
    "mods",
    "systemic inflammatory response syndrome",
    "sirs",
    "sepsis",
    "severe sepsis",
    "septicemia",
    "bacteremia",
    "fungemia",
    "viremia",
    "parasitemia",
    "toxemia",
    "endotoxemia",
    "fever"
  ];

  // Check if any disease keyword is mentioned
  const detectedDisease = diseaseKeywords.find(disease => text.includes(disease));
  if (detectedDisease) {
    return {
      type: "report_disease",
      confidence: 0.9,
      targets: [detectedDisease]
    };
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
  // 3.7 Stop
  // -----------------------------
  if (words.length <= 2 && STOP_WORDS.some(s => text.includes(s))) {
    return { type: "stop", confidence: 0.95 };
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
  // 5. Consult doctor
  // -----------------------------
  if (CONSULT_DOCTOR_WORDS.some(w => text.includes(w))) {
    return { type: "consult_doctor", confidence: 0.85 };
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

