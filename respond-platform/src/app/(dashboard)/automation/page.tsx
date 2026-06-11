import { Topbar } from "@/components/layout/topbar";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Plus, Zap, MessageSquare, Clock, Users, ArrowRight, ToggleLeft } from "lucide-react";

const rules = [
  { id: 1, name: "Welcome Message", trigger: "First contact", action: "Send welcome message", channel: "All", active: true, runs: 248 },
  { id: 2, name: "After Hours Auto-reply", trigger: "Message outside 08:00-18:00", action: "Send office hours reply", channel: "LINE, WhatsApp", active: true, runs: 67 },
  { id: 3, name: "Assign VIP to Sales Team", trigger: "Contact has tag: VIP", action: "Assign to Sales team", channel: "All", active: true, runs: 12 },
  { id: 4, name: "Auto-resolve Inactivity", trigger: "No reply for 24h", action: "Resolve conversation", channel: "All", active: false, runs: 0 },
];

export default function AutomationPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar
        title="Automation"
        subtitle="Manage chatbot flows and auto-reply rules"
        actions={<Button size="sm"><Plus className="w-4 h-4" />New Rule</Button>}
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Bot, label: "Active Bots", value: 2, color: "bg-blue-50 text-blue-600" },
            { icon: Zap, label: "Active Rules", value: rules.filter(r => r.active).length, color: "bg-yellow-50 text-yellow-600" },
            { icon: MessageSquare, label: "Auto-replies Today", value: 127, color: "bg-green-50 text-green-600" },
          ].map((s) => (
            <Card key={s.label}>
              <CardBody className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900">{s.value}</p>
                  <p className="text-xs text-slate-500">{s.label}</p>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        <Card>
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Automation Rules</h2>
            <p className="text-sm text-slate-500 mt-0.5">Trigger-based auto-reply and routing rules</p>
          </div>
          <div className="divide-y divide-slate-100">
            {rules.map((rule) => (
              <div key={rule.id} className="flex items-center gap-4 px-5 py-4">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">{rule.name}</p>
                    <Badge variant={rule.active ? "success" : "secondary"}>{rule.active ? "Active" : "Disabled"}</Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{rule.trigger}</span>
                    <ArrowRight className="w-3 h-3" />
                    <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{rule.action}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-right shrink-0">
                  <div className="text-xs text-slate-500">
                    <p className="font-semibold text-slate-900">{rule.runs}</p>
                    <p>runs</p>
                  </div>
                  <Badge variant="secondary">{rule.channel}</Badge>
                  <Button variant="ghost" size="icon"><ToggleLeft className="w-4 h-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">Chatbot Flows</h2>
              <p className="text-sm text-slate-500 mt-0.5">Visual flow builder for automated conversations</p>
            </div>
            <Button size="sm"><Plus className="w-4 h-4" />New Flow</Button>
          </div>
          <CardBody>
            <div className="flex items-center justify-center h-32 border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
              <div className="text-center">
                <Bot className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Create your first chatbot flow</p>
                <Button size="sm" className="mt-3">Open Flow Builder</Button>
              </div>
            </div>
          </CardBody>
        </Card>

      </div>
    </div>
  );
}
