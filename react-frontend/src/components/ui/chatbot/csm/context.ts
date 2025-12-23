// context.ts
import { ConversationState } from "./states";
import { IntentType } from "../intents/intentDetector";

export interface ConversationContext {
  state: ConversationState;
  intent?: IntentType;
  confidence?: number;

  collected: {
    symptoms?: string[];
    age?: number;
    gender?: string;
    height?: number;
    weight?: number;
    location?: string;
    specialist?: string;
  };

  patientProfile?: {
    age?: number;
    gender?: string;
    height?: number;
    weight?: number;
    address?: string;
  };

  lastAnalysisResult?: {
    recommendedSpecialization?: string;
    [key: string]: any;
  };

  fieldToUpdate?: string;
  sessionId?: string;
}

export function createInitialContext(): ConversationContext {
  return {
    state: ConversationState.HANDLE_INTENT,
    collected: {}
  };
}

export const REQUIRED_PROFILE_FIELDS = [
  "age",
  "gender",
  "height",
  "weight",
  "location"
] as const;

export type ProfileField = typeof REQUIRED_PROFILE_FIELDS[number];
