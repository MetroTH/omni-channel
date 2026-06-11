import { createClient } from "@/lib/supabase/server";
import type { Message } from "@/types";

export async function getMessages(conversationId: string): Promise<Message[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ip_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  return (data ?? []).map((row) => ({
    id: row.id,
    conversationId: row.conversation_id,
    type: row.type as Message["type"],
    content: row.content,
    mediaUrl: row.media_url ?? undefined,
    sender: row.sender as Message["sender"],
    agentId: row.agent_id ?? undefined,
    timestamp: row.created_at,
    status: row.status as Message["status"],
    callStatus: (row.call_status as Message["callStatus"]) ?? undefined,
    callDuration: row.call_duration ?? undefined,
  }));
}

export async function sendMessage(
  conversationId: string,
  content: string,
  agentId: string
): Promise<Message> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ip_messages")
    .insert({ conversation_id: conversationId, content, sender: "agent", agent_id: agentId, status: "sent" })
    .select()
    .single();
  if (error) throw error;
  return {
    id: data.id,
    conversationId: data.conversation_id,
    type: data.type as Message["type"],
    content: data.content,
    sender: data.sender as Message["sender"],
    agentId: data.agent_id ?? undefined,
    timestamp: data.created_at,
    status: data.status as Message["status"],
  };
}
