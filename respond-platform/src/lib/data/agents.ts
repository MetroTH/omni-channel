import { createClient } from "@/lib/supabase/server";
import type { Agent } from "@/types";

export async function getAgents(): Promise<Agent[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ip_profiles")
    .select(`*, ip_team_members(team_id, ip_teams(name))`)
    .order("name");

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    avatar: row.avatar_url ?? undefined,
    status: row.status,
    role: row.role,
    teams: (row.ip_team_members as unknown as { ip_teams: { name: string } | null }[])
      .map((tm) => tm.ip_teams?.name ?? "")
      .filter(Boolean),
  }));
}

export async function getCurrentProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("ip_profiles")
    .select("*")
    .eq("auth_user_id", user.id)
    .single();
  return data;
}

export async function updateProfileStatus(
  status: "online" | "busy" | "away" | "offline"
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("ip_profiles").update({ status }).eq("auth_user_id", user.id);
}
