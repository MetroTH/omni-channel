import { Topbar } from "@/components/layout/topbar";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart2, TrendingUp, Clock, Users, Download } from "lucide-react";

const weekData = [
  { day: "Mon", conversations: 42, resolved: 38, calls: 8 },
  { day: "Tue", conversations: 55, resolved: 50, calls: 12 },
  { day: "Wed", conversations: 38, resolved: 35, calls: 6 },
  { day: "Thu", conversations: 61, resolved: 58, calls: 15 },
  { day: "Fri", conversations: 48, resolved: 44, calls: 10 },
  { day: "Sat", conversations: 22, resolved: 20, calls: 3 },
  { day: "Sun", conversations: 15, resolved: 14, calls: 2 },
];

const max = Math.max(...weekData.map(d => d.conversations));

export default function ReportsPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar
        title="Reports"
        subtitle="Analytics and performance metrics"
        actions={
          <Button variant="outline" size="sm"><Download className="w-4 h-4" />Export</Button>
        }
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: BarChart2, label: "Total This Week", value: "281", sub: "conversations", color: "bg-blue-50 text-blue-600", trend: "+14%" },
            { icon: TrendingUp, label: "Resolution Rate", value: "95%", sub: "of conversations", color: "bg-green-50 text-green-600", trend: "+2%" },
            { icon: Clock, label: "Avg Response", value: "4.2m", sub: "first response", color: "bg-purple-50 text-purple-600", trend: "-0.8m" },
            { icon: Users, label: "CSAT Score", value: "4.7/5", sub: "customer rating", color: "bg-yellow-50 text-yellow-600", trend: "+0.2" },
          ].map((s) => (
            <Card key={s.label}>
              <CardBody className="flex flex-col gap-2">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.color}`}>
                  <s.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                  <p className="text-xs text-slate-500">{s.sub}</p>
                </div>
                <span className="text-xs text-green-600 font-medium">{s.trend} vs last week</span>
              </CardBody>
            </Card>
          ))}
        </div>

        <Card>
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Conversation Volume — This Week</h2>
          </div>
          <CardBody>
            <div className="flex items-end gap-2 h-40">
              {weekData.map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-slate-500">{d.conversations}</span>
                  <div className="w-full flex flex-col gap-0.5" style={{ height: `${(d.conversations / max) * 120}px` }}>
                    <div className="flex-1 bg-blue-500 rounded-t-md" style={{ height: `${(d.resolved / d.conversations) * 100}%` }} />
                    <div className="bg-blue-200 rounded-b-md" style={{ height: `${((d.conversations - d.resolved) / d.conversations) * 100}%` }} />
                  </div>
                  <span className="text-xs font-medium text-slate-600">{d.day}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-3 h-2 bg-blue-500 rounded inline-block" />Resolved</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-2 bg-blue-200 rounded inline-block" />Open</span>
            </div>
          </CardBody>
        </Card>

      </div>
    </div>
  );
}
