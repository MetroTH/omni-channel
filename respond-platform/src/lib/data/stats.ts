import { createClient } from "@/lib/supabase/server";
import type { DashboardStats } from "@/types";

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = today.toISOString();

  const [
    { count: totalConversations },
    { count: openConversations },
    { count: resolvedToday },
    { count: onlineAgents },
    { count: totalAgents },
    { count: callsToday },
    { count: missedCalls },
  ] = await Promise.all([
    supabase.from("ip_conversations").select("*", { count: "exact", head: true }),
    supabase.from("ip_conversations").select("*", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("ip_conversations").select("*", { count: "exact", head: true }).eq("status", "resolved").gte("updated_at", todayIso),
    supabase.from("ip_profiles").select("*", { count: "exact", head: true }).eq("status", "online"),
    supabase.from("ip_profiles").select("*", { count: "exact", head: true }),
    supabase.from("ip_calls").select("*", { count: "exact", head: true }).gte("created_at", todayIso),
    supabase.from("ip_calls").select("*", { count: "exact", head: true }).eq("status", "missed").gte("created_at", todayIso),
  ]);

  return {
    totalConversations: totalConversations ?? 0,
    openConversations: openConversations ?? 0,
    resolvedToday: resolvedToday ?? 0,
    avgResponseTime: 4.2,
    onlineAgents: onlineAgents ?? 0,
    totalAgents: totalAgents ?? 0,
    callsToday: callsToday ?? 0,
    missedCalls: missedCalls ?? 0,
  };
}
