import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

type Channel = Database["public"]["Enums"]["ip_channel"];

export interface UpsertContactParams {
  externalId: string;
  name: string;
  channel: Channel;
  phone?: string;
}

export interface UpsertContactResult {
  contactId: string;
  conversationId: string;
}

/**
 * Upsert a contact (matched on external_id + channel) and ensure an open/pending
 * conversation exists for that contact+channel pair.
 *
 * Returns the resolved contact ID and conversation ID.
 */
export async function upsertContactAndConversation(
  supabase: SupabaseClient<Database>,
  params: UpsertContactParams
): Promise<UpsertContactResult> {
  const { externalId, name, channel, phone } = params;

  // Upsert the contact — conflict target: (external_id, channel)
  const { data: contact, error: contactError } = await supabase
    .from("ip_contacts")
    .upsert(
      {
        external_id: externalId,
        channel,
        name,
        ...(phone ? { phone } : {}),
        last_seen: new Date().toISOString(),
      },
      { onConflict: "external_id,channel" }
    )
    .select("id")
    .single();

  if (contactError || !contact) {
    throw new Error(
      `Failed to upsert contact: ${contactError?.message ?? "unknown error"}`
    );
  }

  const contactId = contact.id;

  // Look for an existing non-resolved conversation for this contact+channel
  const { data: existing } = await supabase
    .from("ip_conversations")
    .select("id")
    .eq("contact_id", contactId)
    .eq("channel", channel)
    .neq("status", "resolved")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) {
    return { contactId, conversationId: existing.id };
  }

  // Create a new conversation
  const { data: conversation, error: convError } = await supabase
    .from("ip_conversations")
    .insert({
      contact_id: contactId,
      channel,
      status: "open",
      unread_count: 0,
    })
    .select("id")
    .single();

  if (convError || !conversation) {
    throw new Error(
      `Failed to create conversation: ${convError?.message ?? "unknown error"}`
    );
  }

  return { contactId, conversationId: conversation.id };
}

export interface InsertInboundMessageParams {
  conversationId: string;
  content: string;
  externalId: string;
  type?: Database["public"]["Enums"]["ip_message_type"];
}

/**
 * Insert an inbound message from a contact, then bump unread_count + updated_at
 * on the parent conversation.
 */
export async function insertInboundMessage(
  supabase: SupabaseClient<Database>,
  params: InsertInboundMessageParams
): Promise<void> {
  const { conversationId, content, externalId, type = "text" } = params;

  const { data: message, error: msgError } = await supabase
    .from("ip_messages")
    .insert({
      conversation_id: conversationId,
      content,
      external_id: externalId,
      sender: "contact",
      type,
      status: "delivered",
    })
    .select("id")
    .single();

  if (msgError || !message) {
    throw new Error(
      `Failed to insert inbound message: ${msgError?.message ?? "unknown error"}`
    );
  }

  // Atomic increment via raw SQL to avoid read-modify-write race conditions.
  // Requires the ip_increment_conversation_unread RPC (see supabase/migrations).
  const rpcResult = await supabase.rpc("ip_increment_conversation_unread" as never, {
    p_conversation_id: conversationId,
    p_last_message_id: message.id,
  } as never);

  if (rpcResult.error) {
    // RPC not yet deployed — fall back to best-effort update
    await supabase
      .from("ip_conversations")
      .update({
        updated_at: new Date().toISOString(),
        last_message_id: message.id,
      })
      .eq("id", conversationId);
  }
}
