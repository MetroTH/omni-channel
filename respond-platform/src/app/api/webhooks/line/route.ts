import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import {
  verifySignature,
  parseEvents,
} from "@/lib/channels/line";
import {
  upsertContactAndConversation,
  insertInboundMessage,
} from "@/lib/channels/webhook-helpers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ status: "ok" });
}

export async function POST(request: NextRequest) {
  const rawBody = Buffer.from(await request.arrayBuffer());

  const supabase = await createAdminClient();

  const { data: config } = await supabase
    .from("ip_channel_configs")
    .select("*")
    .eq("type", "line")
    .eq("enabled", true)
    .limit(1)
    .maybeSingle();

  if (!config) {
    return NextResponse.json({ status: "ok" });
  }

  const creds = config.credentials as Record<string, string>;
  const channelSecret = creds.channel_secret ?? "";

  const signature = request.headers.get("x-line-signature") ?? "";
  if (!verifySignature(rawBody, signature, channelSecret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody.toString("utf8"));
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const events = parseEvents(body);
  const accessToken = creds.channel_access_token ?? "";

  for (const event of events) {
    if (event.type !== "message") continue;
    if (!event.message || event.message.type !== "text") continue;

    const userId = event.source.userId;
    const text = event.message.text ?? "";
    const messageId = event.message.id;

    try {
      const { conversationId } = await upsertContactAndConversation(supabase, {
        externalId: userId,
        name: userId,
        channel: "line",
      });

      await insertInboundMessage(supabase, {
        conversationId,
        content: text,
        externalId: messageId,
        type: "text",
      });
    } catch (err) {
      console.error("[LINE webhook] Error processing event:", err);
    }
  }

  return NextResponse.json({ status: "ok" });
}
