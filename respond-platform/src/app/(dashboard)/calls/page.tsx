import { Topbar } from "@/components/layout/topbar";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/server";
import { formatTime } from "@/lib/utils";
import { Phone, PhoneMissed, PhoneIncoming, PhoneOutgoing, Clock, Voicemail } from "lucide-react";

type CallRow = {
  id: string; direction: string; status: string; duration: number;
  from_number: string | null; to_number: string | null; created_at: string;
  ip_contacts: { name: string } | null;
  ip_profiles: { name: string } | null;
};

const statusConfig: Record<string, { label: string; badge: "default" | "success" | "warning" | "destructive" | "secondary" }> = {
  answered: { label: "Answered", badge: "success" },
  missed: { label: "Missed", badge: "destructive" },
  voicemail: { label: "Voicemail", badge: "warning" },
  ringing: { label: "Ringing", badge: "default" },
  ended: { label: "Ended", badge: "secondary" },
};

export default async function CallsPage() {
  const supabase = await createClient();
  const today = new Date(); today.setHours(0,0,0,0);

  const [{ data: calls }, { count: totalToday }, { count: inbound }, { count: outbound }, { count: missed }] = await Promise.all([
    supabase.from("ip_calls").select(`*, ip_contacts(name), ip_profiles:agent_id(name)`).order("created_at", { ascending: false }).limit(50),
    supabase.from("ip_calls").select("*", { count: "exact", head: true }).gte("created_at", today.toISOString()),
    supabase.from("ip_calls").select("*", { count: "exact", head: true }).eq("direction","inbound").gte("created_at", today.toISOString()),
    supabase.from("ip_calls").select("*", { count: "exact", head: true }).eq("direction","outbound").gte("created_at", today.toISOString()),
    supabase.from("ip_calls").select("*", { count: "exact", head: true }).eq("status","missed").gte("created_at", today.toISOString()),
  ]);

  const callRows = (calls ?? []) as unknown as CallRow[];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Calls" subtitle="Voice call history and management" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Phone, label: "Total Calls Today", value: totalToday ?? 0, color: "bg-blue-50 text-blue-600" },
            { icon: PhoneIncoming, label: "Inbound", value: inbound ?? 0, color: "bg-green-50 text-green-600" },
            { icon: PhoneOutgoing, label: "Outbound", value: outbound ?? 0, color: "bg-purple-50 text-purple-600" },
            { icon: PhoneMissed, label: "Missed", value: missed ?? 0, color: "bg-red-50 text-red-600" },
          ].map((s) => (
            <Card key={s.label}>
              <CardBody className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <div><p className="text-xl font-bold text-slate-900">{s.value}</p><p className="text-xs text-slate-500">{s.label}</p></div>
              </CardBody>
            </Card>
          ))}
        </div>

        <Card>
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Call History</h2>
            <Button variant="outline" size="sm"><Phone className="w-3.5 h-3.5" />Make a Call</Button>
          </div>
          <div className="overflow-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>{["Caller","Phone","Type","Status","Duration","Time","Agent",""].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {callRows.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-8 text-slate-400 text-sm">No calls yet</td></tr>
                )}
                {callRows.map((call) => {
                  const cfg = statusConfig[call.status] ?? { label: call.status, badge: "secondary" as const };
                  const callerName = call.ip_contacts?.name ?? "Unknown";
                  const duration = call.duration > 0
                    ? `${Math.floor(call.duration/60)}:${String(call.duration%60).padStart(2,"0")}`
                    : "—";
                  return (
                    <tr key={call.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar name={callerName} size="sm" />
                          <span className="text-sm font-medium text-slate-900">{callerName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{call.from_number ?? "—"}</td>
                      <td className="px-4 py-3">
                        {call.direction === "inbound"
                          ? <span className="flex items-center gap-1 text-xs text-green-600"><PhoneIncoming className="w-3.5 h-3.5" />Inbound</span>
                          : <span className="flex items-center gap-1 text-xs text-purple-600"><PhoneOutgoing className="w-3.5 h-3.5" />Outbound</span>}
                      </td>
                      <td className="px-4 py-3"><Badge variant={cfg.badge}>{cfg.label}</Badge></td>
                      <td className="px-4 py-3 text-sm text-slate-600"><Clock className="w-3.5 h-3.5 inline text-slate-400 mr-1" />{duration}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">{formatTime(call.created_at)}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{call.ip_profiles?.name ?? "—"}</td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="sm"><Phone className="w-3.5 h-3.5" />Call back</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
