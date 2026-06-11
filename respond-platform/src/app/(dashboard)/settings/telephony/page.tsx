"use client";
import { useState } from "react";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Phone, Settings, CheckCircle2, AlertCircle, Eye, EyeOff,
  PhoneCall, PhoneIncoming, Voicemail, Volume2, Save,
  RefreshCw, Plus, Trash2, TestTube2
} from "lucide-react";
import type { TelephonyConfig } from "@/types";

const providers = [
  {
    id: "twilio" as const, name: "Twilio", logo: "T",
    color: "bg-red-500", description: "Global VoIP & SMS platform. Best for international calls.",
    features: ["Voice calls", "SMS", "WhatsApp Business", "SIP trunking"],
  },
  {
    id: "sip" as const, name: "Custom SIP", logo: "SIP",
    color: "bg-blue-600", description: "Connect your own PBX or SIP trunk provider.",
    features: ["SIP/VoIP", "Custom PBX", "Asterisk/FreeSWITCH", "PJSIP"],
  },
  {
    id: "plivo" as const, name: "Plivo", logo: "P",
    color: "bg-purple-600", description: "Cost-effective voice & SMS for Asia Pacific.",
    features: ["Voice calls", "SMS", "Low cost Asia", "REST API"],
  },
  {
    id: "vonage" as const, name: "Vonage", logo: "V",
    color: "bg-indigo-600", description: "Enterprise-grade communications platform.",
    features: ["Voice calls", "Video", "SMS", "Enterprise SLA"],
  },
];

const defaultConfig: TelephonyConfig = {
  provider: "twilio",
  accountSid: "",
  authToken: "",
  phoneNumber: "",
  recordCalls: true,
  voicemailEnabled: true,
  maxQueueSize: 10,
};

function ToggleSwitch({ checked, onChange, label, description }: {
  checked: boolean; onChange: (v: boolean) => void; label: string; description?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-900">{label}</p>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
          checked ? "bg-blue-600" : "bg-slate-200"
        )}
      >
        <span className={cn("inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform", checked ? "translate-x-6" : "translate-x-1")} />
      </button>
    </div>
  );
}

function MaskInput({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="relative">
        <input
          type={isPassword && !show ? "password" : "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-9"
        />
        {isPassword && (
          <button type="button" onClick={() => setShow(!show)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

function PhoneNumberRow({ number, isPrimary }: { number: string; isPrimary?: boolean }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
        <Phone className="w-4 h-4 text-blue-600" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-900">{number}</p>
        <p className="text-xs text-slate-500">Thailand · Voice + SMS</p>
      </div>
      {isPrimary && <Badge variant="success">Primary</Badge>}
      <Button variant="ghost" size="icon"><Settings className="w-3.5 h-3.5" /></Button>
      <Button variant="ghost" size="icon"><Trash2 className="w-3.5 h-3.5 text-red-400" /></Button>
    </div>
  );
}

export default function TelephonySettingsPage() {
  const [selectedProvider, setSelectedProvider] = useState<"twilio" | "sip" | "plivo" | "vonage">("twilio");
  const [config, setConfig] = useState<TelephonyConfig>(defaultConfig);
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "ok" | "fail">("idle");
  const [saved, setSaved] = useState(false);

  const updateConfig = (key: keyof TelephonyConfig, value: unknown) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleTest = async () => {
    setTestStatus("testing");
    await new Promise((r) => setTimeout(r, 2000));
    setTestStatus(config.accountSid ? "ok" : "fail");
  };

  const handleSave = () => { setSaved(true); };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar
        title="Telephony Settings"
        subtitle="Configure voice calls, SIP trunking, and phone numbers"
        actions={
          <Button onClick={handleSave} size="sm">
            <Save className="w-4 h-4" />
            {saved ? "Saved!" : "Save Changes"}
          </Button>
        }
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        <Card>
          <CardHeader>
            <h2 className="font-semibold text-slate-900">Telephony Provider</h2>
            <p className="text-sm text-slate-500 mt-0.5">Select and configure your voice/call provider</p>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
              {providers.map((provider) => (
                <button key={provider.id}
                  onClick={() => { setSelectedProvider(provider.id); updateConfig("provider", provider.id); }}
                  className={cn("text-left p-4 rounded-xl border-2 transition-all",
                    selectedProvider === provider.id ? "border-blue-600 bg-blue-50" : "border-slate-200 hover:border-slate-300 bg-white")}>
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm", provider.color)}>
                      {provider.logo}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{provider.name}</p>
                      {selectedProvider === provider.id && <span className="text-xs text-blue-600 font-medium">Active</span>}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">{provider.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {provider.features.map((f) => (
                      <span key={f} className="text-xs bg-slate-100 text-slate-600 rounded px-1.5 py-0.5">{f}</span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </CardBody>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-slate-900">
                  {selectedProvider === "sip" ? "SIP Configuration" : "API Credentials"}
                </h2>
                <div className="flex items-center gap-2">
                  {testStatus === "ok" && <Badge variant="success"><CheckCircle2 className="w-3 h-3 mr-1" />Connected</Badge>}
                  {testStatus === "fail" && <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Failed</Badge>}
                  <Button variant="outline" size="sm" onClick={handleTest} disabled={testStatus === "testing"}>
                    {testStatus === "testing" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <TestTube2 className="w-3.5 h-3.5" />}
                    Test Connection
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              {selectedProvider === "twilio" && (
                <>
                  <MaskInput label="Account SID" value={config.accountSid ?? ""} onChange={(v) => updateConfig("accountSid", v)} placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
                  <MaskInput label="Auth Token" type="password" value={config.authToken ?? ""} onChange={(v) => updateConfig("authToken", v)} placeholder="Your Twilio Auth Token" />
                  <Input label="Twilio Phone Number" value={config.phoneNumber ?? ""} onChange={(e) => updateConfig("phoneNumber", e.target.value)} placeholder="+66XXXXXXXXX" />
                </>
              )}
              {selectedProvider === "sip" && (
                <>
                  <Input label="SIP Server / Domain" value={config.sipServer ?? ""} onChange={(e) => updateConfig("sipServer", e.target.value)} placeholder="sip.example.com" />
                  <Input label="SIP Port" value={config.sipPort ?? "5060"} onChange={(e) => updateConfig("sipPort", e.target.value)} placeholder="5060" />
                  <Input label="SIP Username" value={config.sipUsername ?? ""} onChange={(e) => updateConfig("sipUsername", e.target.value)} placeholder="username" />
                  <MaskInput label="SIP Password" type="password" value={config.sipPassword ?? ""} onChange={(v) => updateConfig("sipPassword", v)} placeholder="SIP password" />
                  <Input label="SIP Domain" value={config.sipDomain ?? ""} onChange={(e) => updateConfig("sipDomain", e.target.value)} placeholder="company.sip.domain" />
                </>
              )}
              {(selectedProvider === "plivo" || selectedProvider === "vonage") && (
                <>
                  <MaskInput label="Auth ID / API Key" value={config.accountSid ?? ""} onChange={(v) => updateConfig("accountSid", v)} placeholder="Your API Key" />
                  <MaskInput label="Auth Token / Secret" type="password" value={config.authToken ?? ""} onChange={(v) => updateConfig("authToken", v)} placeholder="Your API Secret" />
                  <Input label="Phone Number" value={config.phoneNumber ?? ""} onChange={(e) => updateConfig("phoneNumber", e.target.value)} placeholder="+66XXXXXXXXX" />
                </>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader><h2 className="font-semibold text-slate-900">Call Behavior</h2></CardHeader>
            <CardBody className="space-y-5">
              <ToggleSwitch checked={config.recordCalls} onChange={(v) => updateConfig("recordCalls", v)}
                label="Record Calls" description="Save all call recordings for quality and compliance" />
              <ToggleSwitch checked={config.voicemailEnabled} onChange={(v) => updateConfig("voicemailEnabled", v)}
                label="Voicemail" description="Accept voicemails when agents are unavailable" />
              <div>
                <label className="text-sm font-medium text-slate-700">Max Queue Size</label>
                <p className="text-xs text-slate-500 mb-2">Maximum callers waiting in queue</p>
                <div className="flex items-center gap-3">
                  <input type="range" min={1} max={50} value={config.maxQueueSize}
                    onChange={(e) => updateConfig("maxQueueSize", parseInt(e.target.value))}
                    className="flex-1 accent-blue-600" />
                  <span className="text-sm font-bold text-slate-900 w-8 text-right">{config.maxQueueSize}</span>
                </div>
              </div>
              {config.voicemailEnabled && (
                <div>
                  <label className="text-sm font-medium text-slate-700">Voicemail Greeting</label>
                  <textarea value={config.voicemailGreeting ?? ""} onChange={(e) => updateConfig("voicemailGreeting", e.target.value)}
                    placeholder="Hello, you've reached our support team..."
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3} />
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">Phone Numbers</h2>
                <p className="text-sm text-slate-500 mt-0.5">Manage inbound numbers for your team</p>
              </div>
              <Button size="sm"><Plus className="w-4 h-4" />Add Number</Button>
            </div>
          </CardHeader>
          <CardBody className="space-y-2">
            <PhoneNumberRow number="+66 2-742-9000" isPrimary />
            <PhoneNumberRow number="+66 81-234-5678" />
            <div className="flex items-center gap-3 p-3 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-sm cursor-pointer hover:border-blue-400 hover:text-blue-500 transition-colors">
              <Plus className="w-4 h-4" />
              <span>Purchase or port a new number</span>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">IVR & Call Flow</h2>
                <p className="text-sm text-slate-500 mt-0.5">Configure auto-attendant and routing rules</p>
              </div>
              <Button variant="outline" size="sm">Open Flow Builder</Button>
            </div>
          </CardHeader>
          <CardBody>
            <div className="flex items-center gap-4 overflow-x-auto pb-2">
              {[
                { icon: PhoneIncoming, label: "Inbound Call", color: "bg-green-100 text-green-600" },
                { icon: Volume2, label: "Play Greeting", color: "bg-blue-100 text-blue-600" },
                { icon: PhoneCall, label: "Route to Team", color: "bg-purple-100 text-purple-600" },
                { icon: Voicemail, label: "Voicemail", color: "bg-orange-100 text-orange-600" },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-2 shrink-0">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", step.color)}>
                      <step.icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs text-slate-600 font-medium">{step.label}</span>
                  </div>
                  {i < 3 && <div className="w-8 h-0.5 bg-slate-300 mt-[-12px]" />}
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

      </div>
    </div>
  );
}
