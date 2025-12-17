// STEP MANAGER (Final Clean Version)

import type { IntentType } from "./intentDetector";
import { validators, normalizeGender } from "./validators";
import { normalizeText } from "./keywordCorrection";

export type Step =
  | "start"
  | "collect_profile"
  | "confirm_profile"
  | "choose_edit_field"
  | "update_field"
  | "collect_symptoms"
  | "waiting_analysis"
  | "show_results"
  | "finished";

export type ConversationState = {
  step: Step;
  userInfo: any;
  pendingField?: string;
  lastEntities?: any;
  lastIntent?: IntentType;
  lastUserMessage?: string;
};

export type NextAction = {
  type: "message" | "update_state" | "ask_question" | "analyze_symptoms" | "error";
  message?: string;
  nextStep?: Step;
  fieldToUpdate?: string;
};

/* -------------------------------------------------------
   MAIN ENTRY
-------------------------------------------------------- */
export function getNextAction(
  state: ConversationState,
  userMessage: string,
  intent: IntentType,
  entities: any
): NextAction {
  
  // Emergency override
  if (intent === "emergency") return emergencyMessage();

  // Save context
  state.lastEntities = entities;
  state.lastIntent = intent;
  state.lastUserMessage = userMessage;

  // Autofill missing profile fields
  if (state.step === "collect_profile") {
    const maybe = autoFillProfile(state, entities);
    if (maybe) return maybe;
  }

  // Intent routing
  if (intent === "update_profile") return routeUpdateProfile(state, userMessage, entities);
  if (intent === "book_appointment") return routeBookAppointment(state, entities);
  if (intent === "report_symptom") return routeReportSymptoms(state, entities);

  // Step-based routing
  return routeDefault(state, userMessage, intent, entities);
}

/* -------------------------------------------------------
   EMERGENCY
-------------------------------------------------------- */
function emergencyMessage(): NextAction {
  return {
    type: "message",
    message:
      "🚨 EMERGENCY ALERT\nThis may be serious.\nCall emergency services immediately.",
    nextStep: "finished",
  };
}

/* -------------------------------------------------------
   AUTO-FILL PROFILE
-------------------------------------------------------- */
function autoFillProfile(
  state: ConversationState,
  entities: any
): NextAction | null {
  if (!entities) return null;

  let updated = false;
  const ui = { ...state.userInfo };

  if (entities.age && validators.age(Number(entities.age))) {
    ui.age = Number(entities.age);
    updated = true;
  }

  if (entities.gender && validators.gender(entities.gender)) {
    ui.gender = normalizeGender(entities.gender);
    updated = true;
  }

  if (entities.location && validators.location(entities.location)) {
    ui.location = entities.location;
    updated = true;
  }

  if (!updated) return null;

  state.userInfo = ui;
  const missing = missingProfileFields(ui);

  if (!missing.length) {
    return {
      type: "ask_question",
      message:
        `Here is what I have:\nAge: ${ui.age}\nGender: ${ui.gender}\nLocation: ${ui.location}\n\nIs this correct? (yes/no)`,
      nextStep: "confirm_profile",
    };
  }

  return {
    type: "ask_question",
    message: `Got it. Please tell me your ${missing[0]}.`,
    nextStep: "collect_profile",
  };
}

export function missingProfileFields(ui: any): string[] {
  return ["age", "gender", "location"].filter((f) => !ui[f]);
}

/* -------------------------------------------------------
   UPDATE PROFILE — FIXED WITH (1-6) + FUZZY MATCH
-------------------------------------------------------- */
function routeUpdateProfile(
  state: ConversationState,
  userMessage: string,
  entities: any
): NextAction {
  
  // STEP 1: If we are choosing the field
  if (!state.pendingField) {
    let field = detectField(userMessage, entities); // fuzzy + exact + numeric

    if (!field) {
      return {
        type: "ask_question",
        message:
          "Which field would you like to update?\n1. age\n2. gender\n3. height\n4. weight\n5. blood_group\n6. address",
        nextStep: "choose_edit_field",
      };
    }

    state.pendingField = field;

    const ui = state.userInfo;

return {
  type: "message",
  message:
    `Your ${field} has been updated.\n\n` +
    `Here are your updated details:\n` +
    `Age: ${ui.age ?? ui.original_age ?? "Not provided"}\n` +
    `Gender: ${ui.gender ?? ui.original_gender ?? "Not provided"}\n` +
    `Height: ${ui.height ?? ui.original_height ?? "Not provided"}\n` +
    `Weight: ${ui.weight ?? ui.original_weight ?? "Not provided"}\n` +
    `Address: ${ui.address ?? ui.location ?? ui.original_address ?? "Not provided"}\n\n` +
    `Are these correct now? (yes/no)`,
  nextStep: "confirm_profile",
};


  }

  // STEP 2: We are updating the selected field
  const field = state.pendingField;
  let value: any = userMessage;

  // Convert numeric fields
  if (["age", "height", "weight"].includes(field)) {
    value = Number(userMessage);
    if (isNaN(value)) {
      return {
        type: "message",
        message: `Please enter a valid number for ${field}.`,
      };
    }
  }

  // Validate
  if (!validators[field] || !validators[field](value)) {
    return {
      type: "message",
      message: `Invalid value for ${field}. Please try again.`,
    };
  }

  // Save update
  state.userInfo[field] = value;
  state.pendingField = undefined;

  return {
    type: "message",
    message: `Your ${field} has been updated.`,
    nextStep: "confirm_profile",
  };
}

/* -------------------------------------------------------
   APPOINTMENT
-------------------------------------------------------- */
function routeBookAppointment(state: ConversationState, entities: any): NextAction {
  if (!entities?.symptoms?.length) {
    return {
      type: "ask_question",
      message: "Before booking, please describe your symptoms.",
      nextStep: "collect_symptoms",
    };
  }

  return {
    type: "analyze_symptoms",
    message: "Analyzing your symptoms...",
    nextStep: "waiting_analysis",
  };
}

/* -------------------------------------------------------
   REPORT SYMPTOMS
-------------------------------------------------------- */
function routeReportSymptoms(state: ConversationState, entities: any): NextAction {
  if (!entities?.symptoms?.length) {
    return {
      type: "ask_question",
      message: "Please describe your symptoms.",
      nextStep: "collect_symptoms",
    };
  }

  return {
    type: "analyze_symptoms",
    message: "Analyzing your symptoms...",
    nextStep: "waiting_analysis",
  };
}

/* -------------------------------------------------------
   DEFAULT FLOW — FIXED YES/NO HANDLING
-------------------------------------------------------- */
function routeDefault(
  state: ConversationState,
  userMessage: string,
  intent: IntentType,
  entities: any
): NextAction {
  const ui = state.userInfo;

  switch (state.step) {
    
    case "start":
      return {
        type: "ask_question",
        message: "To begin, what is your age?",
        nextStep: "collect_profile",
      };

    case "collect_profile": {
      const missing = missingProfileFields(ui);

      if (!missing.length) {
        return {
          type: "ask_question",
          message:
            `Here is what I have:\nAge: ${ui.age}\nGender: ${ui.gender}\nLocation: ${ui.location}\n\nIs this correct? (yes/no)`,
          nextStep: "confirm_profile",
        };
      }

      return {
        type: "ask_question",
        message: `Please tell me your ${missing[0]}.`,
      };
    }

    /* YES/NO FIXED */
    case "confirm_profile":
      if (intent === "yes") {
        return {
          type: "ask_question",
          message: "Great! Now please describe your symptoms.",
          nextStep: "collect_symptoms",
        };
      }

      if (intent === "no") {
        return {
          type: "ask_question",
          message:
            "Which field would you like to update?\n1. age\n2. gender\n3. height\n4. weight\n5. blood_group\n6. address",
          nextStep: "choose_edit_field",
        };
      }

      return {
        type: "ask_question",
        message: "Please reply 'yes' or 'no'.",
      };

    /* FIXED: choose_edit_field added */
    case "choose_edit_field": {
      const field = detectField(userMessage, entities);

      if (field) {
        return {
          type: "ask_question",
          message: `What is your new ${field}?`,
          nextStep: "update_field",
          fieldToUpdate: field,
        };
      }

      return {
        type: "ask_question",
        message:
          "Which field would you like to update?\n1. age\n2. gender\n3. height\n4. weight\n5. blood_group\n6. address",
      };
    }

    case "update_field": {
  const field = state.pendingField;

  if (!field) {
    return {
      type: "ask_question",
      message: "Which field would you like to update?",
      nextStep: "choose_edit_field",
    };
  }

  // validator exists?
  if (!validators[field]) {
    return {
      type: "message",
      message: `I cannot update '${field}'. Please choose another field.`,
    };
  }

  // Validate the entered value
  if (!validators[field](userMessage)) {
    return {
      type: "ask_question",
      message: `Invalid value for ${field}. Please enter a valid ${field}.`,
      nextStep: "update_field",
    };
  }

  // Commit update
  state.userInfo[field] = userMessage;
  state.pendingField = undefined;

  return {
    type: "message",
    message: `Your ${field} has been updated.`,
    nextStep: "confirm_profile",
  };
}

    case "collect_symptoms":
      if (entities?.symptoms?.length) {
        state.userInfo.symptoms = entities.symptoms;
        return {
          type: "analyze_symptoms",
          message: "Analyzing your symptoms...",
          nextStep: "waiting_analysis",
        };
      }

      return {
        type: "ask_question",
        message: "Please describe your symptoms.",
      };

    

    default:
      return {
        type: "message",
        message: "I didn't understand that. Can you rephrase?",
      };
  }
}

/* -------------------------------------------------------
   FIELD DETECTOR — FINAL FIXED VERSION
-------------------------------------------------------- */
function detectField(message: string, entities: any): string | null {
  const raw = message.toLowerCase().trim();
  const text = normalizeText(raw);

  // 1. Numeric mapping
  const numMap: Record<string, string> = {
    "1": "age",
    "2": "gender",
    "3": "height",
    "4": "weight",
    "5": "blood_group",
    "6": "address",
  };
  if (numMap[raw]) return numMap[raw];

  // 2. Exact direct matching
  const fields = ["age", "gender", "height", "weight", "blood_group", "address", "location"];
  for (const f of fields) if (text.includes(f)) return f;

  // // 3. Entity hints
  // if (entities?.age) return "age";
  // if (entities?.gender) return "gender";

  // 4. Fuzzy matching
const fuzzyMap: Record<string, string> = {
  // AGE typos
  "agee": "age",
  "aeg": "age",
  "ag": "age",
  "dge": "age",
  "agw": "age",
  "aj": "age",
  "ae": "age",

  // GENDER typos
  "gnder": "gender",
  "gende": "gender",
  "gnr": "gender",
  "gendre": "gender",
  "gen": "gender",
  "gdar": "gender",
  "gnd": "gender",
  "gndr": "gender",
  "ganr": "gender",
  "genderr": "gender",

  // HEIGHT typos
  "hieght": "height",
  "heigt": "height",
  "hght": "height",
  "hgt": "height",
  "ht": "height",
  "heit": "height",
  "heght": "height",
  "heiht": "height",
  "hiegh": "height",
  "heigth": "height",

  // WEIGHT typos
  "wight": "weight",
  "wieght": "weight",
  "wegit": "weight",
  "wgt": "weight",
  "whigt": "weight",
  "weit": "weight",
  "weig": "weight",
  "w8": "weight",
  "wt": "weight",

  // BLOOD GROUP typos
  "bloodgroup": "blood_group",
  "bld grp": "blood_group",
  "blod grp": "blood_group",
  "bldgroup": "blood_group",
  "bldgrp": "blood_group",
  "bloodgrp": "blood_group",
  "blood groop": "blood_group",
  "bloodgruop": "blood_group",
  "bg": "blood_group",

  // ADDRESS typos
  "adress": "address",
  "addres": "address",
  "adres": "address",
  "adr": "address",
  "addrs": "address",
  "addresz": "address",
  "adala": "address",
  "add": "address",

  // LOCATION typos
  "loc": "location",
  "loaction": "location",
  "loction": "location",
  "loacation": "location",
  "lacation": "location",
  "lctn": "location",
  "lcoation": "location",
  "loac": "location",
  "locn": "location",
};


  for (const typo in fuzzyMap) {
    if (text.includes(typo)) return fuzzyMap[typo];
  }

   // 4. Normalized fallback (last priority)
  for (const f of fields) {
    if (text.includes(f)) return f;
  }
  // 5. Entity-based guess
  if (entities?.age) return "age";
  if (entities?.gender) return "gender";

  return null;
}
