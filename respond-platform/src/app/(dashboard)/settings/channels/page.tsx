"use client";
import { useState } from "react";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle, Plus, Settings, Trash2, Copy, ExternalLink } from "lucide-react";

const channels = [
  {
    id: "line", name: "LINE", color: "bg-green-500",
    logo: "LINE", description: "Thailand's most popular messaging app",
    fields: [
      { key: "channelId", label: "Channel ID", placeholder: "1234567890" },
      { key: "channelSecret", label: "Channel Secret", placeholder: "abcdef...", secret: true },
      { key: "accessToken", label: "Channel Access Token", placeholder: "Bearer token...", secret: true },
    ],
  },
  {
    id: "whatsapp", name: "WhatsApp Business", color: "bg-emerald-500",
    logo: "WA", description: "WhatsApp Business API via Meta",
    fields: [
      { key: "phoneNumberId", label: "Phone Number ID", placeholder: "1234567890" },
      { key: "businessAccountId", label: "Business Account ID", placeholder: "1234567890" },
      { key: "accessToken", label: "Access Token", placeholder: "EAAxx...", secret: true },
      { key: "webhookToken", label: "Webhook Verify Token", placeholder: "your-verify-token" },
    ],
  },
  {
    id: "facebook", name: "Facebook Messenger", color: "bg-blue-600",
    logo: "FB", description: "Facebook Page Messenger integration",
    fields: [
      { key: "pageId", label: "Page ID", placeholder: "123456789012345" },
      { key: "accessToken", label: "Page Access Token", placeholder: "EAAxx...", secret: true },
      { key: "appSecret", label: "App Secret", placeholder: "abc123...", secret: true },
      { key: "verifyToken", label: "Webhook Verify Token", placeholder: "your-verify-token" },
    ],
  },
  {
    id: "instagram", name: "Instagram DM", color: "bg-pink-500",
    logo: "IG", description: "Instagram Direct Messages via Meta API",
    fields: [
      { key: "instagramAccountId", label: "Instagram Business Account ID", placeholder: "17841..." },
      { key: "accessToken", label: "Access Token", placeholder: "EAAxx...", secret: true },
    ],
  },
  {
    id: "email", name: "Email", color: "bg-slate-600",
    logo: "EM", description: "Connect SMTP/IMAP email inbox",
    fields: [
      { key: "email", label: "Email Address", placeholder: "support@company.com" },
      { key: "smtpHost", label: "SMTP Host", placeholder: "smtp.gmail.com" },
      { key: "smtpPort", label: "SMTP Port", placeholder: "587" },
      { key: "imapHost", label: "IMAP Host", placeholder: "imap.gmail.com" },
      { key: "password", label: "Password / App Password", placeholder: "app password", secret: true },
    ],
  },
];

const connectedChannels = ["line", "whatsapp", "facebook"];

function ChannelCard({ channel }: { channel: typeof channels[0] }) {
  const [expanded, setExpanded] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const isConnected = connectedChannels.includes(channel.id);
  const webhookUrl = `https://your-domain.com/api/webhooks/${channel.id}`;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm", channel.color)}>
            {channel.logo}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900">{channel.name}</h3>
              {isConnected ? (
                <Badge variant="success"><CheckCircle2 className="w-3 h-3 mr-1" />Connected</Badge>
              ) : (
                <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" />Not connected</Badge>
              )}
            </div>
            <p className="text-sm text-slate-500">{channel.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setExpanded(!expanded)}>
              <Settings className="w-4 h-4" />
            </Button>
            {isConnected && (
              <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600">
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardBody className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Webhook URL</label>
            <p className="text-xs text-slate-500 mb-1.5">Set this URL in your {channel.name} developer console</p>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
              <code className="text-xs text-slate-700 flex-1 font-mono truncate">{webhookUrl}</code>
              <button className="text-slate-400 hover:text-slate-600 shrink-0"><Copy className="w-3.5 h-3.5" /></button>
              <a href="#" className="text-slate-400 hover:text-slate-600 shrink-0"><ExternalLink className="w-3.5 h-3.5" /></a>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {channel.fields.map((field) => (
              <div key={field.key}>
                <Input
                  label={field.label}
                  type={field.secret ? "password" : "text"}
                  value={values[field.key] ?? ""}
                  onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Button size="sm">{isConnected ? "Update" : "Connect"}</Button>
            <Button variant="outline" size="sm"><Settings className="w-3.5 h-3.5" />Test Webhook</Button>
          </div>
        </CardBody>
      )}
    </Card>
  );
}

export default function ChannelsPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar
        title="Channel Integrations"
        subtitle="Connect messaging channels to your inbox"
        actions={<Button size="sm"><Plus className="w-4 h-4" />Add Channel</Button>}
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-900">3 channels connected</p>
            <p className="text-xs text-blue-600">LINE, WhatsApp Business, and Facebook Messenger are active</p>
          </div>
        </div>
        {channels.map((channel) => (
          <ChannelCard key={channel.id} channel={channel} />
        ))}
      </div>
    </div>
  );
}
