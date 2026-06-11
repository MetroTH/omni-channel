import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const apiKey = process.env.TWILIO_API_KEY;
  const apiSecret = process.env.TWILIO_API_SECRET;
  const twimlAppSid = process.env.TWILIO_TWIML_APP_SID;

  if (!accountSid || !apiKey || !apiSecret || !twimlAppSid) {
    return NextResponse.json({ error: "Twilio not configured" }, { status: 503 });
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("ip_profiles").select("id").eq("auth_user_id", user.id).single();
  const identity = profile?.id ?? user.id;

  let twilioLib: {
    jwt: {
      AccessToken: {
        new (accountSid: string, apiKey: string, apiSecret: string, opts: { identity: string; ttl: number }): {
          addGrant: (grant: unknown) => void;
          toJwt: () => string;
        };
        VoiceGrant: new (opts: { outgoingApplicationSid: string; incomingAllow: boolean }) => unknown;
      };
    };
  };

  try {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
    twilioLib = (new Function("m", "return require(m)"))("twilio");
  } catch {
    return NextResponse.json({ error: "Twilio package not installed — run: npm i twilio" }, { status: 503 });
  }

  const { AccessToken } = twilioLib.jwt;
  const { VoiceGrant } = AccessToken;

  const token = new AccessToken(accountSid, apiKey, apiSecret, { identity, ttl: 3600 });
  const voiceGrant = new VoiceGrant({ outgoingApplicationSid: twimlAppSid, incomingAllow: true });
  token.addGrant(voiceGrant);

  return NextResponse.json({ token: token.toJwt(), identity });
}
