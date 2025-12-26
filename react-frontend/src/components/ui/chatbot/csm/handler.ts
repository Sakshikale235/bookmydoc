// handler.ts
import { ConversationContext } from "./context";
import { ConversationState } from "./states";
import { getMissingProfileFields } from "./profileUtils";
import { DetectedIntent } from "../intents/intentDetector";
import {
  parseAge,
  parseGender,
  parseHeight,
  parseWeight,
  parseLocation
} from "./inputParsers";

export function handleConversation(
  context: ConversationContext,
  intent: DetectedIntent,
  userMessage: string
): ConversationContext {

  switch (context.state) {

    // -----------------------------
    // IDLE → HANDLE INTENT
    // -----------------------------
    case ConversationState.IDLE:
      return {
        ...context,
        state: ConversationState.HANDLE_INTENT,
        intent: intent.type,
        confidence: intent.confidence
      };

    // -----------------------------
    // HANDLE INTENT
    // -----------------------------
    case ConversationState.HANDLE_INTENT:
      if (intent.type === "emergency") {
        return { ...context, state: ConversationState.EMERGENCY_FLOW };
      }

      if (intent.type === "stop") {
        return { ...context, state: ConversationState.END };
      }

      if (
        intent.type === "report_symptom" ||
        intent.type === "book_appointment"
      ) {
        return { ...context, state: ConversationState.ASK_SYMPTOMS };
      }

      if (intent.type === "update_profile") {
        return { ...context, state: ConversationState.CONFIRM_PROFILE };
      }

      return { ...context, state: ConversationState.IDLE };

    // -----------------------------
    // ASK SYMPTOMS → CONFIRM PROFILE
    // -----------------------------
    case ConversationState.ASK_SYMPTOMS:
      return {
        ...context,
        state: ConversationState.CONFIRM_PROFILE
      };

    // -----------------------------
    // CONFIRM PROFILE
    // -----------------------------
    case ConversationState.CONFIRM_PROFILE: {
      // User explicitly wants to update profile
      if (intent.type === "update_profile") {
        return {
          ...context,
          state: ConversationState.ASK_WHICH_PROFILE_FIELD
        };
      }

      const missingFields = getMissingProfileFields(context);

      if (missingFields.length === 0) {
        return {
          ...context,
          state: ConversationState.MEDICAL_CONTEXT_ANALYSIS
        };
      }

      const nextField = missingFields[0];

      switch (nextField) {
        case "age":
          return { ...context, state: ConversationState.ASK_AGE };
        case "gender":
          return { ...context, state: ConversationState.ASK_GENDER };
        case "height":
          return { ...context, state: ConversationState.ASK_HEIGHT };
        case "weight":
          return { ...context, state: ConversationState.ASK_WEIGHT };
        case "location":
          return { ...context, state: ConversationState.ASK_LOCATION };
        default:
          return context;
      }
    }

    // -----------------------------
    // CAPTURE PROFILE FIELDS
    // -----------------------------
    case ConversationState.ASK_AGE: {
      const age = parseAge(userMessage);
      if (age !== null) {
        return {
          ...context,
          collected: { ...context.collected, age },
          state: ConversationState.CONFIRM_PROFILE
        };
      }
      return context;
    }

    case ConversationState.ASK_GENDER: {
      const gender = parseGender(userMessage);
      if (gender) {
        return {
          ...context,
          collected: { ...context.collected, gender },
          state: ConversationState.CONFIRM_PROFILE
        };
      }
      return context;
    }

    case ConversationState.ASK_HEIGHT: {
      const height = parseHeight(userMessage);
      if (height !== null) {
        return {
          ...context,
          collected: { ...context.collected, height },
          state: ConversationState.CONFIRM_PROFILE
        };
      }
      return context;
    }

    case ConversationState.ASK_WEIGHT: {
      const weight = parseWeight(userMessage);
      if (weight !== null) {
        return {
          ...context,
          collected: { ...context.collected, weight },
          state: ConversationState.CONFIRM_PROFILE
        };
      }
      return context;
    }

    case ConversationState.ASK_LOCATION: {
      const location = parseLocation(userMessage);
      if (location) {
        return {
          ...context,
          collected: { ...context.collected, location },
          state: ConversationState.CONFIRM_PROFILE
        };
      }
      return context;
    }

    // -----------------------------
    // CONFIRM BOOKING
    // -----------------------------
    case ConversationState.CONFIRM_BOOKING:
      if (intent.type === "yes") {
        return { ...context, state: ConversationState.BOOK_APPOINTMENT };
      }
      return { ...context, state: ConversationState.END };

    // -----------------------------
    // EMERGENCY
    // -----------------------------
    case ConversationState.EMERGENCY_FLOW:
      return { ...context, state: ConversationState.END };

    default:
      return context;
  }
}
