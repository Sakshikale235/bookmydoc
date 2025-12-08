// react-frontend/src/lib/chatApi.ts
export async function createConversation(authId?: string, metadata?: any) {
  const res = await fetch("/api/chat/create/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ auth_id: authId, metadata }),
  });
  if (!res.ok) throw new Error("create conversation failed");
  return res.json(); // { id, ... }
}

export async function appendMessage(conversationId: string, role: string, text: string, meta?: any) {
  const res = await fetch("/api/chat/messages/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ conversation_id: conversationId, role, text, meta }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`appendMessage failed: ${txt}`);
  }
  return res.json();
}

export async function fetchHistory(conversationId: string, limit = 200) {
  const res = await fetch(`/api/chat/${conversationId}/history/?limit=${limit}`);
  if (!res.ok) throw new Error("fetch history failed");
  return res.json(); // { conversation, messages: [...] }
}
