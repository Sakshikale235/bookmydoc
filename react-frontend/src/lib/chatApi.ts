// Chat persistence disabled. Provide safe no-op stubs so callers don't crash.
export async function createConversation(authId?: string, metadata?: any) {
  console.warn("createConversation called but chat persistence is disabled. Returning null.");
  return null;
}

export async function appendMessage(conversationId: string, role: string, text: string, meta?: any) {
  console.warn("appendMessage called but chat persistence is disabled.");
  return { ok: true };
}

export async function fetchHistory(conversationId: string, limit = 200) {
  console.warn("fetchHistory called but chat persistence is disabled. Returning empty history.");
  return { conversation: null, messages: [] };
}
