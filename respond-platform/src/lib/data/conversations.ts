import { createClient } from "@/lib/supabase/server";
import type { Conversation, Message } from "@/types";

type ConvRow = {
  id: string;
  channel: Conversation["channel"];
  status: Conversation["status"];
  assigned_to: string | null;
  last_message_id: string | null;
  unread_count: number;
  tags: string[];
  is_bot: boolean;
  created_at: string;
  updated_at: string;
  ip_contacts: {
    id: string; name: string; phone: string | null; email: string | null;
    avatar_url: string | null; tags: string[]; status: string; channel: string;
    assigned_to: string | null; notes: string | null;
    created_at: string; last_seen: string | null;
  } | null;
  assigned_agent: { id: string; name: string; email: string; status: string; role: string; avatar_url: string | null } | null;
  last_message: { id: string; type: string; content: string; sender: string; agent_id: string | null; status: string; call_status: string | null; call_duration: number | null; created_at: string } | null;
};

function mapConversation(row: ConvRow): Conversation {
  const contact = row.ip_contacts!;
  const lastMsg = row.last_message;

  return {
    id: row.id,
    channel: row.channel,
    status: row.status,
    assignedTo: row.assigned_to ?? undefined,
    assignedAgent: row.assigned_agent ? {
      id: row.assigned_agent.id,
      name: row.assigned_agent.name,
      email: row.assigned_agent.email,
      status: row.assigned_agent.status as Conversation["channel"] extends never ? never : "online" | "busy" | "away" | "offline",
      role: row.assigned_agent.role as "admin" | "supervisor" | "agent",
      teams: [],
    } : undefined,
    unreadCount: row.unread_count,
    tags: row.tags,
    isBot: row.is_bot,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    contact: {
      id: contact.id,
      name: contact.name,
      phone: contact.phone ?? undefined,
      email: contact.email ?? undefined,
      avatar: contact.avatar_url ?? undefined,
      tags: contact.tags,
      status: contact.status as "active" | "inactive" | "blocked",
      channel: contact.channel as Conversation["channel"],
      assignedTo: contact.assigned_to ?? undefined,
      notes: contact.notes ?? undefined,
      customFields: {},
      createdAt: contact.created_at,
      lastSeen: contact.last_seen ?? undefined,
    },
    lastMessage: lastMsg ? {
      id: lastMsg.id,
      conversationId: row.id,
      type: lastMsg.type as Message["type"],
      content: lastMsg.content,
      sender: lastMsg.sender as Message["sender"],
      agentId: lastMsg.agent_id ?? undefined,
      timestamp: lastMsg.created_at,
      status: lastMsg.status as Message["status"],
      callStatus: (lastMsg.call_status as Message["callStatus"]) ?? undefined,
      callDuration: lastMsg.call_duration ?? undefined,
    } : undefined,
  };
}

export async function getConversations(status?: string): Promise<Conversation[]> {
  const supabase = await createClient();
  let query = supabase
    .from("ip_conversations")
    .select(`
      *,
      ip_contacts(*),
      assigned_agent:ip_profiles!ip_conversations_assigned_to_fkey(*),
      last_message:ip_messages!ip_conversations_last_message_fk(*)
    `)
    .order("updated_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status as "open" | "pending" | "resolved" | "snoozed");
  }

  const { data } = await query;
  return (data ?? []).map((row) => mapConversation(row as unknown as ConvRow));
}

export async function resolveConversation(id: string) {
  const supabase = await createClient();
  await supabase.from("ip_conversations").update({ status: "resolved" }).eq("id", id);
}

export async function assignConversation(id: string, agentId: string) {
  const supabase = await createClient();
  await supabase.from("ip_conversations").update({ assigned_to: agentId }).eq("id", id);
}

export async function markAsRead(id: string) {
  const supabase = await createClient();
  await supabase.from("ip_conversations").update({ unread_count: 0 }).eq("id", id);
}
