import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type TelephonyProvider = Database["public"]["Enums"]["ip_telephony_provider"];

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: isAdmin } = await supabase.rpc("ip_is_admin");
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = await createAdminClient();

  const [{ data: config, error: configError }, { data: phoneNumbers, error: numbersError }] =
    await Promise.all([
      admin.from("ip_telephony_config").select("*").limit(1).maybeSingle(),
      admin.from("ip_phone_numbers").select("*").order("is_primary", { ascending: false }),
    ]);

  if (configError) {
    return NextResponse.json({ error: configError.message }, { status: 500 });
  }

  if (numbersError) {
    return NextResponse.json({ error: numbersError.message }, { status: 500 });
  }

  return NextResponse.json({ config: config ?? null, phoneNumbers: phoneNumbers ?? [] });
}

interface UpsertTelephonyBody {
  provider?: TelephonyProvider;
  config?: Record<string, string | number | boolean | null>;
  record_calls?: boolean;
  voicemail_enabled?: boolean;
  voicemail_greeting?: string;
  hold_music?: string;
  max_queue_size?: number;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: isAdmin } = await supabase.rpc("ip_is_admin");
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: UpsertTelephonyBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    provider = "twilio",
    config: providerConfig = {},
    record_calls = false,
    voicemail_enabled = false,
    voicemail_greeting,
    hold_music,
    max_queue_size,
  } = body;

  const admin = await createAdminClient();

  const { data: existing } = await admin
    .from("ip_telephony_config")
    .select("id")
    .limit(1)
    .maybeSingle();

  const upsertPayload: Database["public"]["Tables"]["ip_telephony_config"]["Insert"] = {
    provider,
    config: providerConfig as import("@/lib/types/database").Json,
    record_calls,
    voicemail_enabled,
    voicemail_greeting: voicemail_greeting ?? null,
    hold_music: hold_music ?? null,
    updated_at: new Date().toISOString(),
    ...(max_queue_size !== undefined ? { max_queue_size } : {}),
  };

  if (existing?.id) {
    upsertPayload.id = existing.id;
  }

  const { data, error } = await admin
    .from("ip_telephony_config")
    .upsert(upsertPayload, { onConflict: "id" })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ config: data }, { status: 201 });
}
