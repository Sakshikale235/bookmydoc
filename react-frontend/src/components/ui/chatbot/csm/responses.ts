// responses.ts
import { ConversationState } from "./states";
import { ConversationContext } from "./context";

export function getBotResponse(context: ConversationContext): string {
  switch (context.state) {
    case ConversationState.IDLE:
      return "Hi! How can I help you today?";

    case ConversationState.ASK_SYMPTOMS:
      return "Please describe the symptoms you are experiencing.";

    case ConversationState.VERIFY_PROFILE:
      return "Before proceeding, I want to confirm your profile details.";

    case ConversationState.ASK_WHICH_PROFILE_FIELD:
      return "Which detail would you like to update? Age, Gender, Height, Weight, or Location?";

    case ConversationState.ASK_AGE:
      return "May I know your age?";

    case ConversationState.ASK_GENDER:
      return "Please tell me your gender.";

    case ConversationState.ASK_HEIGHT:
      return "What is your height?";

    case ConversationState.ASK_WEIGHT:
      return "What is your weight?";

    case ConversationState.ASK_LOCATION:
      return "Which city are you currently in?";

    case ConversationState.CONFIRM_BOOKING:
      return "Would you like to book an appointment with the recommended specialist?";

    case ConversationState.EMERGENCY_FLOW:
      return "This seems like a medical emergency. Please seek immediate medical help.";

    case ConversationState.END:
      return "Is there anything else I can help you with?";

    default:
      return "Let me check that for you.";
  }
}
