// profileUtils.ts
import { ConversationContext } from "./context";
import { ProfileField, REQUIRED_PROFILE_FIELDS } from "./context";

export function getMissingProfileFields(
  context: ConversationContext
): ProfileField[] {
  return REQUIRED_PROFILE_FIELDS.filter(
    field => !context.collected[field]
  );
}
