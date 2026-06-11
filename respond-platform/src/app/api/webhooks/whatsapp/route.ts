import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { verifySignature, parseMessages } from "@/lib/channels/whatsapp";
import { upsertContactAndConversation, insertInboundMessage } from "@/lib/channels/webhook-helpers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode !== "subscribe" || !token) return new NextResponse("Bad Request", { status: 400 });

  const supabase = await createAdminClient();
  const { data: config } = await supabase.from("ip_channel_configs").select("credentials").eq("type", "whatsapp").eq("enabled", true).limit(1).maybeSingle();
  if (!config) return new NextResponse("Forbidden", { status: 403 });

  const creds = config.credentials as Record<string, string>;
  if (token !== (creds.verify_token ?? "")) return new NextResponse("Forbidden", { status: 403 });
  return new NextResponse(challenge ?? "", { status: 200 });
}

export async function POST(request: NextRequest) {
  const rawBody = Buffer.from(await request.arrayBuffer());
  const supabase = await createAdminClient();

  const { data: config } = await supabase.from("ip_channel_configs").select("*").eq("type", "whatsapp").eq("enabled", true).limit(1).maybeSingle();
  if (!config) return NextResponse.json({ status: "ok" });

  const creds = config.credentials as Record<string, string>;
  const signature = request.headers.get("x-hub-signature-256") ?? "";
  if (!verifySignature(rawBody, signature, creds.app_secret ?? "")) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body: unknown;
  try { body = JSON.parse(rawBody.toString("utf8")); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const messages = parseMessages(body);
  const phoneNumberId = creds.phone_number_id ?? "";

  for (const msg of messages) {
    if (msg.type !== "text" || !msg.text?.body) continue;
    try {
      const { conversationId } = await upsertContactAndConversation(supabase, { externalId: msg.from, name: msg.from, channel: "whatsapp", phone: msg.from });
      await insertInboundMessage(supabase, { conversationId, content: msg.text.body, externalId: msg.id, type: "text" });
    } catch (err) { console.error("[WhatsApp webhook] Error processing message:", err, { phoneNumberId }); }
  }

  return NextResponse.json({ status: "ok" });
}
