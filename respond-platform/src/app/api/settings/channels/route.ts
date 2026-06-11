import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ChannelType = Database["public"]["Enums"]["ip_channel"];

// GET /api/settings/channels
export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: isAdmin } = await supabase.rpc("ip_is_admin");
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const admin = await createAdminClient();
  const { data, error } = await admin.from("ip_channel_configs").select("*").order("type");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ channels: data });
}

interface UpsertChannelBody {
  type: ChannelType;
  name: string;
  credentials: Record<string, string | number | boolean | null>;
  webhook_url?: string;
  enabled?: boolean;
}

// POST /api/settings/channels
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: isAdmin } = await supabase.rpc("ip_is_admin");
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: UpsertChannelBody;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

  const { type, name, credentials, webhook_url, enabled = true } = body;
  if (!type || !name) return NextResponse.json({ error: "type and name are required" }, { status: 400 });

  const admin = await createAdminClient();
  const { data, error } = await admin.from("ip_channel_configs").upsert(
    { type, name, credentials: (credentials ?? {}) as import("@/lib/types/database").Json, webhook_url: webhook_url ?? null, enabled, updated_at: new Date().toISOString() },
    { onConflict: "type" }
  ).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ channel: data }, { status: 201 });
}
