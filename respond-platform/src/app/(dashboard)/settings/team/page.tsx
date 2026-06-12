import { Topbar } from "@/components/layout/topbar";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { getAgents } from "@/lib/data/agents";
import { Plus, Settings, Mail, Shield, MoreVertical } from "lucide-react";

const roleVariant: Record<string, "default" | "warning" | "success" | "secondary" | "outline"> = {
  admin: "outline", supervisor: "warning", agent: "default",
};

export default async function TeamPage() {
  const agents = await getAgents();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar
        title="Team"
        subtitle="Manage agents, roles, and permissions"
        actions={<Button size="sm"><Plus className="w-4 h-4" />Invite Agent</Button>}
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Total Agents", value: agents.length, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Online Now", value: agents.filter(a => a.status === "online").length, color: "text-green-600", bg: "bg-green-50" },
            { label: "Admins", value: agents.filter(a => a.role === "admin").length, color: "text-purple-600", bg: "bg-purple-50" },
          ].map((s) => (
            <Card key={s.label}>
              <CardBody className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <span className={`text-2xl font-bold ${s.color}`}>{s.value}</span>
                </div>
                <p className="text-sm font-medium text-slate-700">{s.label}</p>
              </CardBody>
            </Card>
          ))}
        </div>

        <Card>
          <div className="px-5 py-4 border-b border-slate-100"><h2 className="font-semibold text-slate-900">Team Members</h2></div>
          <div className="divide-y divide-slate-100">
            {agents.map((agent) => (
              <div key={agent.id} className="flex items-center gap-4 px-5 py-4">
                <Avatar name={agent.name} size="md" status={agent.status} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{agent.name}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1"><Mail className="w-3 h-3" />{agent.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {agent.teams.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}
                  </div>
                  <Badge variant={roleVariant[agent.role]}><Shield className="w-3 h-3 mr-1" />{agent.role}</Badge>
                  <Badge variant={agent.status === "online" ? "success" : agent.status === "busy" ? "destructive" : "secondary"}>{agent.status}</Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon"><Settings className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
