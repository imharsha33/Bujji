import type { Msg } from "./chat-stream";

export interface Conversation {
  id: string;
  title: string;
  messages: Msg[];
  createdAt: number;
}

const KEY = "chatbot_conversations";

export function loadConversations(): Conversation[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveConversations(convos: Conversation[]) {
  localStorage.setItem(KEY, JSON.stringify(convos));
}

export function createConversation(): Conversation {
  return {
    id: crypto.randomUUID(),
    title: "New Chat",
    messages: [],
    createdAt: Date.now(),
  };
}
