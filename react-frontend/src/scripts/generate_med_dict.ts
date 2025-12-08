// generate_med_dict.ts
// Run: npx ts-node scripts/generate_med_dict.ts
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Base lists (you can extend these)
const symptoms = [
  "fever","cough","cold","sore throat","headache","nausea","vomiting","diarrhea","fatigue","dizziness",
  "shortness of breath","chest pain","abdominal pain","back pain","joint pain","muscle pain","rash",
  "itching","sneezing","runny nose","loss of smell","loss of taste","chills","night sweats","weight loss",
  "weight gain","constipation","urinary frequency","burning urination","blood in urine","numbness",
  "tingling","blurred vision","eye pain","ear pain","hearing loss","tinnitus","palpitations","anxiety",
  "depression","insomnia","menstrual pain","irregular periods","infertility","breast pain","breast lump",
  "hair loss","dry skin","oily skin","acne","swelling","edema","cold intolerance","heat intolerance",
  "excessive thirst","polyuria","constipation","bloating","acid reflux","heartburn","indigestion","hiccups",
];

const conditions = [
  "common cold","influenza","covid-19","urinary tract infection","uti","gastroenteritis",
  "migraine","tension headache","hypertension","diabetes","type 1 diabetes","type 2 diabetes",
  "asthma","bronchitis","pneumonia","bronchiectasis","tuberculosis","pneumothorax","anemia",
  "iron deficiency anemia","allergic rhinitis","sinusitis","otitis media","conjunctivitis",
  "eczema","psoriasis","urticaria","cellulitis","dermatitis","appendicitis","cholecystitis",
  "peptic ulcer disease","gallstones","kidney stones","renal colic","osteoarthritis","rheumatoid arthritis",
];

const bodyparts = [
  "head","chest","abdomen","stomach","back","neck","throat","ear","eye","nose","leg","arm","knee","hip",
  "shoulder","wrist","ankle","pelvis","groin","genitals","urinary tract","urine","bladder","kidney"
];

const profile = ["age","gender","height","weight","blood group","address","location","phone","dob","email"];

const genders = ["male","female","trans","non-binary","other"];

const meds = [
  "paracetamol","acetaminophen","ibuprofen","aspirin","amoxicillin","azithromycin","ciprofloxacin","metformin",
  "insulin","lisinopril","atorvastatin","simvastatin","amlodipine","omeprazole","pantoprazole"
];

const hinglish = [
  "bukhar","bukhaar","khasi","khaasi","dard","pet dard","chakkar","sirdard","sardi","jukaam","kharash",
  "peshab karte waqt jalan","peshab mein jalan","pet mein jalan","gardi dard","pair dard"
];

// Misspelling patterns to generate naive misspellings
function generateMisspellings(word: string) {
  const variants = new Set<string>();
  const w = word.toLowerCase();
  variants.add(w);

  // common transforms
  if (w.length > 3) {
    // delete one char
    for (let i = 0; i < w.length; i++) {
      variants.add(w.slice(0, i) + w.slice(i + 1));
    }
    // transpose neighbor chars
    for (let i = 0; i < w.length - 1; i++) {
      variants.add(w.slice(0, i) + w[i + 1] + w[i] + w.slice(i + 2));
    }
    // double a char
    for (let i = 0; i < w.length; i++) {
      variants.add(w.slice(0, i) + w[i] + w.slice(i));
    }
    // replace vowels
    const vowels = { a: "ae", e: "ei", i: "iy", o: "ou", u: "ua" };
    for (let i = 0; i < w.length; i++) {
      const ch = w[i];
      if (vowels[ch]) {
        variants.add(w.slice(0, i) + vowels[ch][0] + w.slice(i + 1));
      }
    }
  }

  return Array.from(variants).slice(0, 20); // limit per word
}

// gather base list
let dict = new Set<string>();
[symptoms, conditions, bodyparts, profile, genders, meds, hinglish].forEach((arr) =>
  arr.forEach((w) => dict.add(w.toLowerCase()))
);

// expand with misspellings and variants
const base = Array.from(dict);
for (const w of base) {
  const miss = generateMisspellings(w);
  miss.forEach((m) => dict.add(m));
}

// add more programmatic medical terms (prefixes/suffixes)
const prefixes = ["hyper", "hypo", "post", "pre", "acute", "chronic", "severe", "mild"];
const suffixes = ["itis", "osis", "oma", "opathy", "algia", "emia", "itis", "itis"];
for (const p of prefixes) {
  for (const b of ["tension", "thyroid", "gastric", "cardiac", "respiratory"]) {
    dict.add((p + b).toLowerCase());
  }
}
for (const s of suffixes) {
  for (const b of ["arthr", "neur", "card", "hepat"]) {
    dict.add((b + s).toLowerCase());
  }
}

// keep adding until >5000 by repeating variations with index suffix
let i = 0;
const items = Array.from(dict);
while (dict.size < 5200) {
  for (const w of items) {
    dict.add(w + (i % 13 === 0 ? "" : String(i % 13)));
    if (dict.size >= 5200) break;
  }
  i++;
}

// Convert to array and write file
const out = Array.from(dict).sort();
const outPath = path.join(__dirname, "..", "data", "medical_dictionary.json");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(out, null, 2), "utf-8");
console.log("Wrote", out.length, "words to", outPath);
