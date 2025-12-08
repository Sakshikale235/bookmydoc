// src/components/ui/chatbot/steps.ts
import { Intent } from "./intentDetector";
import { validators } from "./validators";

export type Step =
  | "start"
  | "confirm"
  | "choose_edit_field"
  | "update_field"
  | "collect_symptoms"
  | "waiting_analysis"
  | "show_results"
  | "finished";

export const fieldNames: any = {
  "1": "age",
  "2": "gender",
  "3": "height",
  "4": "weight",
  "5": "blood_group",
  "6": "address",
};

export type ConversationState = {
  step: Step;
  userInfo: any;
  intent?: Intent;
  entities?: any;
  lastMessage?: string;
};

export type NextAction = {
  type: "message" | "update_state" | "ask_question" | "analyze_symptoms" | "error";
  message?: string;
  nextStep?: Step;
  fieldToUpdate?: string;
  validationError?: string;
};

export function getNextAction(state: ConversationState, userMessage: string, intent: Intent, entities: any): NextAction {
  // Validate entities if present
  if (entities) {
    const validationErrors = validateEntities(entities);
    if (validationErrors.length > 0) {
      return {
        type: "error",
        message: `Invalid input: ${validationErrors.join(", ")}. Please provide correct information.`,
      };
    }
  }

  switch (intent) {
    case "update_profile":
      return handleUpdateProfile(state, userMessage, entities);
    case "book_appointment":
      return handleBookAppointment(state, entities);
    case "report_symptom":
      return handleReportSymptom(state, entities);
    case "emergency":
      return {
        type: "message",
        message: "🚨 **EMERGENCY ALERT!**\n\nThis appears to be a medical emergency. Please:\n\n1. **Call emergency services immediately** (911 or local emergency number)\n2. Stay calm and follow their instructions\n3. If possible, provide your location\n\n**Do not wait - seek immediate medical attention!**",
      };
    default:
      // Fallback based on current step
      return handleDefaultFlow(state, userMessage, entities);
  }
}

function validateEntities(entities: any): string[] {
  const errors: string[] = [];
  if (entities.age && !validators.age(entities.age.toString())) {
    errors.push("Age must be between 1 and 119");
  }
  if (entities.gender && !validators.gender(entities.gender)) {
    errors.push("Gender must be male, female, or trans");
  }
  if (entities.symptoms) {
    for (const symptom of entities.symptoms) {
      if (!validators.symptoms(symptom)) {
        errors.push(`Invalid symptom: ${symptom}`);
      }
    }
  }
  return errors;
}

function handleUpdateProfile(state: ConversationState, userMessage: string, entities: any): NextAction {
  if (state.step === "start" || !state.userInfo) {
    return {
      type: "message",
      message: "Please provide your current information first. What is your age?",
      nextStep: "collect_symptoms", // Temporary, should be profile collection
    };
  }

  // If specific field mentioned in entities or message
  const field = detectFieldToUpdate(userMessage, entities);
  if (field) {
    return {
      type: "ask_question",
      message: `What is your new ${field}?`,
      nextStep: "update_field",
      fieldToUpdate: field,
    };
  }

  return {
    type: "message",
    message: "Which field would you like to update? Options: age, gender, height, weight, blood_group, address",
    nextStep: "choose_edit_field",
  };
}

function handleBookAppointment(state: ConversationState, entities: any): NextAction {
  if (!entities.symptoms || entities.symptoms.length === 0) {
    return {
      type: "ask_question",
      message: "To book an appointment, please describe your symptoms first.",
      nextStep: "collect_symptoms",
    };
  }

  return {
    type: "analyze_symptoms",
    message: "Analyzing your symptoms to find the right specialist...",
  };
}

function handleReportSymptom(state: ConversationState, entities: any): NextAction {
  if (!entities.symptoms || entities.symptoms.length === 0) {
    return {
      type: "ask_question",
      message: "Please describe your symptoms in detail.",
      nextStep: "collect_symptoms",
    };
  }

  return {
    type: "analyze_symptoms",
    message: "Thank you for sharing your symptoms. Analyzing now...",
  };
}

function handleDefaultFlow(state: ConversationState, userMessage: string, entities: any): NextAction {
  switch (state.step) {
    case "start":
      return {
        type: "ask_question",
        message: "Hello! To get started, what is your age?",
        nextStep: "confirm",
      };
    case "confirm":
      if (userMessage.toLowerCase() === "yes") {
        return {
          type: "ask_question",
          message: "Great! Please describe your symptoms.",
          nextStep: "collect_symptoms",
        };
      } else if (userMessage.toLowerCase() === "no") {
        return {
          type: "message",
          message: "Which information needs to be updated?\n\n1️⃣ Age\n2️⃣ Gender\n3️⃣ Height\n4️⃣ Weight\n5️⃣ Blood Group\n6️⃣ Address",
          nextStep: "choose_edit_field",
        };
      }
      return {
        type: "ask_question",
        message: "Please reply 'yes' or 'no' to confirm your information.",
      };
    case "collect_symptoms":
      if (entities.symptoms && entities.symptoms.length > 0) {
        return {
          type: "analyze_symptoms",
          message: "Thank you. Analyzing your symptoms...",
        };
      }
      return {
        type: "ask_question",
        message: "Please provide more details about your symptoms.",
      };
    default:
      return {
        type: "message",
        message: "I'm not sure how to help with that. Can you please rephrase?",
      };
  }
}

function detectFieldToUpdate(message: string, entities: any): string | null {
  const lowerMessage = message.toLowerCase();
  const fields = ["age", "gender", "height", "weight", "blood_group", "address"];

  for (const field of fields) {
    if (lowerMessage.includes(field)) {
      return field;
    }
  }

  // Check entities for hints
  if (entities.age) return "age";
  if (entities.gender) return "gender";

  return null;
}
