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
    const url = request.url;
    const params = formDataToRecord(formData);
    if (!verifyTwilioSignature(authToken, signature, url, params)) {
      return new NextResponse("Forbidden", { status: 403 });
    }
  }
  const to = formData.get("To") as string | null;
  const from = formData.get("From") as string | null;
  const callSid = formData.get("CallSid") as string | null;
  const direction = formData.get("Direction") as string | null;

  const admin = await createAdminClient();
  const { data: primaryNumber } = await admin
    .from("ip_phone_numbers")
    .select("number")
    .eq("is_primary", true)
    .limit(1)
    .maybeSingle();

  const callerIdNumber = primaryNumber?.number ?? from ?? "";

  let twiml: string;

  const isOutbound =
    (to && to.startsWith("+")) ||
    direction === "outbound-api" ||
    direction === "outbound-dial";

  if (isOutbound && to) {
    twiml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      "<Response>",
      `  <Dial callerId="${escapeXml(callerIdNumber)}">`,
      `    <Number>${escapeXml(to)}</Number>`,
      "  </Dial>",
      "</Response>",
    ].join("\n");
  } else {
    const { data: agents } = await admin
      .from("ip_profiles")
      .select("id")
      .eq("status", "online")
      .order("created_at")
      .limit(1);

    const agent = agents?.[0];

    if (agent) {
      twiml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        "<Response>",
        "  <Dial>",
        `    <Client>${escapeXml(agent.id)}</Client>`,
        "  </Dial>",
        "</Response>",
      ].join("\n");
    } else {
      twiml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        "<Response>",
        "  <Say>Sorry, no agents are available right now. Please leave a message after the tone.</Say>",
        `  <Record maxLength="60" playBeep="true" />`,
        "</Response>",
      ].join("\n");
    }
  }

  if (process.env.NODE_ENV === "development") {
    console.debug("[twilio/voice]", { callSid, from, to, direction });
  }

  return new NextResponse(twiml, {
    status: 200,
    headers: { "Content-Type": "text/xml; charset=utf-8" },
  });
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
