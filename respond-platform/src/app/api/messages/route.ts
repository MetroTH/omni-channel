import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { sendMessage as sendLineMesage } from "@/lib/channels/line";
import { sendMessage as sendWhatsAppMessage } from "@/lib/channels/whatsapp";
import { sendMessage as sendFacebookMessage } from "@/lib/channels/facebook";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface SendMessageBody {
  conversationId: string;
  content: string;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: SendMessageBody;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

  const { conversationId, content } = body;
  if (!conversationId || !content) return NextResponse.json({ error: "conversationId and content are required" }, { status: 400 });

  const { data: profile } = await supabase.from("ip_profiles").select("id").eq("auth_user_id", user.id).single();
  const agentProfileId = profile?.id ?? null;

  const admin = createAdminClient();

  const { data: conversation, error: convError } = await admin.from("ip_conversations").select("id, channel, contact:ip_contacts(id, external_id, phone, name)").eq("id", conversationId).single();
  if (convError || !conversation) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });

  const channel = conversation.channel;
  const contact = Array.isArray(conversation.contact) ? conversation.contact[0] : conversation.contact;
  if (!contact) return NextResponse.json({ error: "Contact not found for this conversation" }, { status: 404 });

  const { data: channelConfig } = await admin.from("ip_channel_configs").select("credentials").eq("type", channel).eq("enabled", true).limit(1).maybeSingle();

  const { data: message, error: insertError } = await admin.from("ip_messages").insert({
    conversation_id: conversationId,
    content,
    sender: "agent",
    agent_id: agentProfileId,
    status: "sending",
    type: "text",
  }).select().single();

  if (insertError || !message) return NextResponse.json({ error: "Failed to insert message" }, { status: 500 });

  let dispatchError: string | null = null;

  try {
    if (!channelConfig) throw new Error(`No enabled channel config found for channel: ${channel}`);
    const creds = channelConfig.credentials as Record<string, string>;
    const externalId = contact.external_id ?? "";
    const phone = contact.phone ?? externalId;

    switch (channel) {
      case "line": await sendLineMesage(externalId, [{ type: "text", text: content }], creds.channel_access_token ?? ""); break;
      case "whatsapp": await sendWhatsAppMessage(creds.phone_number_id ?? "", phone, content, creds.access_token ?? ""); break;
      case "facebook": await sendFacebookMessage(creds.page_id ?? "", externalId, content, creds.access_token ?? ""); break;
      default: throw new Error(`Unsupported outbound channel: ${channel}`);
    }
  } catch (err) {
    console.error("[messages/POST] Dispatch error:", err);
    dispatchError = err instanceof Error ? err.message : String(err);
  }

  const newStatus = dispatchError ? "failed" : "sent";
  const { data: updatedMessage } = await admin.from("ip_messages").update({ status: newStatus }).eq("id", message.id).select().single();

  await admin.from("ip_conversations").update({ updated_at: new Date().toISOString(), last_message_id: message.id }).eq("id", conversationId);

  if (dispatchError) {
    return NextResponse.json({ message: updatedMessage ?? message, warning: `Message saved but delivery failed: ${dispatchError}` }, { status: 207 });
  }

  return NextResponse.json({ message: updatedMessage ?? message }, { status: 201 });
}
