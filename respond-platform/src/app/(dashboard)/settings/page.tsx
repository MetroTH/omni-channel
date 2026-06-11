import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardBody } from "@/components/ui/card";
import { Phone, Hash, Users, Bell, Lock, Globe, Palette, Webhook } from "lucide-react";

const settingsGroups = [
  {
    title: "Integrations",
    items: [
      { href: "/settings/telephony", icon: Phone, label: "Telephony", desc: "VoIP, SIP, call routing", color: "bg-purple-100 text-purple-600" },
      { href: "/settings/channels", icon: Hash, label: "Channels", desc: "LINE, WhatsApp, Facebook", color: "bg-green-100 text-green-600" },
      { href: "#", icon: Webhook, label: "Webhooks", desc: "Custom webhooks & API", color: "bg-orange-100 text-orange-600" },
    ],
  },
  {
    title: "Team & Access",
    items: [
      { href: "/settings/team", icon: Users, label: "Team", desc: "Agents, roles, permissions", color: "bg-blue-100 text-blue-600" },
      { href: "#", icon: Lock, label: "Security", desc: "2FA, SSO, IP allowlist", color: "bg-red-100 text-red-600" },
    ],
  },
  {
    title: "Preferences",
    items: [
      { href: "#", icon: Bell, label: "Notifications", desc: "Email and push notifications", color: "bg-yellow-100 text-yellow-600" },
      { href: "#", icon: Globe, label: "Localization", desc: "Language and timezone", color: "bg-teal-100 text-teal-600" },
      { href: "#", icon: Palette, label: "Appearance", desc: "Theme and branding", color: "bg-pink-100 text-pink-600" },
    ],
  },
];

export default function SettingsPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Settings" subtitle="Configure your InboxPro workspace" />
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {settingsGroups.map((group) => (
          <section key={group.title}>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">{group.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {group.items.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Card className="hover:shadow-md transition-all cursor-pointer">
                    <CardBody className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color}`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                        <p className="text-xs text-slate-500">{item.desc}</p>
                      </div>
                    </CardBody>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
