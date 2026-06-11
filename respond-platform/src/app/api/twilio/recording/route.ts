import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { verifyTwilioSignature, formDataToRecord } from "@/lib/twilio/validate";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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
  const recordingUrl = formData.get("RecordingUrl") as string | null;
  const recordingSid = formData.get("RecordingSid") as string | null;

  if (!callSid) return NextResponse.json({ error: "CallSid required" }, { status: 400 });
  if (!recordingUrl) return NextResponse.json({ ok: true });

  const admin = await createAdminClient();
  const formattedUrl = recordingUrl.endsWith(".mp3") ? recordingUrl : `${recordingUrl}.mp3`;

  const { error } = await admin.from("ip_calls").update({ recording_url: formattedUrl }).eq("twilio_sid", callSid);
  if (error) console.error("[twilio/recording] Update error:", error, { recordingSid });

  return NextResponse.json({ ok: true });
}
