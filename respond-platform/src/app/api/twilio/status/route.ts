import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { verifyTwilioSignature, formDataToRecord } from "@/lib/twilio/validate";
import type { Database } from "@/lib/types/database";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type IpCallStatus = Database["public"]["Enums"]["ip_call_status"];
type IpCallDirection = Database["public"]["Enums"]["ip_call_direction"];

function mapTwilioStatus(twilioStatus: string): IpCallStatus {
  switch (twilioStatus) {
    case "ringing":
    case "queued":
      return "ringing";
    case "in-progress":
      return "answered";
    case "no-answer":
    case "canceled":
    case "busy":
      return "missed";
    case "completed":
      return "ended";
    case "failed":
      return "ended";
    default:
      return "ended";
  }
}

function mapDirection(twilioDirection: string): IpCallDirection {
  if (
    twilioDirection === "outbound-api" ||
    twilioDirection === "outbound-dial"
  ) {
    return "outbound";
  }
  return "inbound";
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (authToken) {
    const signature = request.headers.get("x-twilio-signature") ?? "";
    if (!verifyTwilioSignature(authToken, signature, request.url, formDataToRecord(formData))) {
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  const callSid = formData.get("CallSid") as string | null;
  const callStatus = formData.get("CallStatus") as string | null;
  const callDuration = formData.get("CallDuration") as string | null;
  const from = formData.get("From") as string | null;
  const to = formData.get("To") as string | null;
  const direction = formData.get("Direction") as string | null;

  if (!callSid) {
    return NextResponse.json({ error: "CallSid required" }, { status: 400 });
  }

  const status = mapTwilioStatus(callStatus ?? "");
  const mappedDirection = mapDirection(direction ?? "inbound");
  const duration = parseInt(callDuration ?? "0", 10) || 0;

  const admin = await createAdminClient();

  const { error } = await admin
    .from("ip_calls")
    .upsert(
      {
        twilio_sid: callSid,
        status,
        direction: mappedDirection,
        duration,
        from_number: from ?? null,
        to_number: to ?? null,
      },
      { onConflict: "twilio_sid" }
    );

  if (error) {
    console.error("[twilio/status] Upsert error:", error);
  }

  return NextResponse.json({ ok: true });
}
