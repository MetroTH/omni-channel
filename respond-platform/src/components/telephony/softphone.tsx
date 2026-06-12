"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface TwilioCallParams {
  get?: (key: string) => string | undefined;
}

interface TwilioCall {
  customParameters?: TwilioCallParams;
  parameters?: Record<string, string>;
  accept: () => void;
  reject: () => void;
  disconnect: () => void;
  mute: (muted: boolean) => void;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
}

interface TwilioDeviceOptions {
  logLevel?: string;
}

interface TwilioDevice {
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  register: () => Promise<void>;
  destroy: () => void;
  connect: (options: { params: Record<string, string> }) => Promise<TwilioCall>;
}

interface TwilioDeviceConstructor {
  new (token: string, options?: TwilioDeviceOptions): TwilioDevice;
}

type CallStatus = "idle" | "connecting" | "ringing" | "active" | "ending";

interface IncomingCallInfo {
  callerId: string;
}

export interface SoftphoneHandle {
  makeCall: (to: string, contactName: string) => void;
}

export const softphoneRef: { current: SoftphoneHandle | null } = { current: null };

export function makeCall(to: string, contactName: string): void {
  softphoneRef.current?.makeCall(to, contactName);
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function Softphone() {
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [device, setDevice] = useState<TwilioDevice | null>(null);
  const [connection, setConnection] = useState<TwilioCall | null>(null);
  const [timer, setTimer] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [incomingCall, setIncomingCall] = useState<TwilioCall | null>(null);
  const [incomingCallInfo, setIncomingCallInfo] = useState<IncomingCallInfo | null>(null);
  const [activeContactName, setActiveContactName] = useState<string>("");
  const [twilioAvailable, setTwilioAvailable] = useState<boolean | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleCallEnd = useCallback(() => {
    setCallStatus("ending");
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setConnection(null);
    setIsMuted(false);
    setActiveContactName("");
    setTimeout(() => setCallStatus("idle"), 800);
  }, []);

  const makeCallHandler = useCallback(
    (to: string, contactName: string) => {
      if (!device || callStatus !== "idle") return;
      setActiveContactName(contactName);
      setCallStatus("connecting");
      device.connect({ params: { To: to } })
        .then((call) => {
          setConnection(call);
          setCallStatus("ringing");
          call.on("accept", () => { setCallStatus("active"); setTimer(0); });
          call.on("disconnect", () => handleCallEnd());
          call.on("cancel", () => handleCallEnd());
          call.on("error", (err: unknown) => { console.error("[Softphone] Call error:", err); handleCallEnd(); });
        })
        .catch((err: unknown) => { console.error("[Softphone] connect error:", err); setCallStatus("idle"); });
    },
    [device, callStatus, handleCallEnd]
  );

  useEffect(() => {
    softphoneRef.current = { makeCall: makeCallHandler };
    return () => { softphoneRef.current = null; };
  }, [makeCallHandler]);

  useEffect(() => {
    if (callStatus === "active") {
      timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    } else {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      if (callStatus === "idle") setTimer(0);
    }
    return () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };
  }, [callStatus]);

  useEffect(() => {
    let mounted = true;
    let dev: TwilioDevice | null = null;

    async function initDevice() {
      try {
        const res = await fetch("/api/twilio/token");
        if (!res.ok) { setTwilioAvailable(false); return; }
        const { token, identity } = (await res.json()) as { token: string; identity: string };
        if (!mounted) return;
        console.debug("[Softphone] Initializing Twilio Device for", identity);
        // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
        const sdk = await (new Function("path", "return import(path)"))("@twilio/voice-sdk") as { Device: TwilioDeviceConstructor };
        dev = new sdk.Device(token, { logLevel: process.env.NODE_ENV === "development" ? "debug" : "warn" });
        dev.on("registered", () => { if (!mounted) return; setTwilioAvailable(true); });
        dev.on("error", (err: unknown) => console.error("[Softphone] Device error:", err));
        dev.on("incoming", (call: unknown) => {
          if (!mounted) return;
          const twilioCall = call as TwilioCall;
          const callerId = twilioCall.customParameters?.get?.("From") ?? twilioCall.parameters?.["From"] ?? "Unknown caller";
          setIncomingCall(twilioCall);
          setIncomingCallInfo({ callerId });
          twilioCall.on("cancel", () => { if (!mounted) return; setIncomingCall(null); setIncomingCallInfo(null); });
        });
        await dev.register();
        if (mounted) setDevice(dev);
      } catch (err: unknown) {
        console.error("[Softphone] Device init error:", err);
        if (mounted) setTwilioAvailable(false);
      }
    }

    initDevice();
    return () => {
      mounted = false;
      if (dev) { try { dev.destroy(); } catch { /* ignore */ } }
    };
  }, []);

  const acceptCall = useCallback(() => {
    if (!incomingCall) return;
    const call = incomingCall;
    setConnection(call);
    setActiveContactName(incomingCallInfo?.callerId ?? "Incoming call");
    setCallStatus("active");
    setTimer(0);
    setIncomingCall(null);
    setIncomingCallInfo(null);
    call.accept();
    call.on("disconnect", () => handleCallEnd());
    call.on("error", (err: unknown) => { console.error("[Softphone] Incoming call error:", err); handleCallEnd(); });
  }, [incomingCall, incomingCallInfo, handleCallEnd]);

  const rejectCall = useCallback(() => {
    if (!incomingCall) return;
    incomingCall.reject();
    setIncomingCall(null);
    setIncomingCallInfo(null);
  }, [incomingCall]);

  const toggleMute = useCallback(() => {
    if (!connection) return;
    const next = !isMuted;
    connection.mute(next);
    setIsMuted(next);
  }, [connection, isMuted]);

  const hangup = useCallback(() => {
    if (!connection) return;
    connection.disconnect();
    handleCallEnd();
  }, [connection, handleCallEnd]);

  if (twilioAvailable === false) return null;
  if (callStatus === "idle" && !incomingCall) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2" role="complementary" aria-label="Softphone">
      {incomingCall && incomingCallInfo && (
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 w-72 animate-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm flex-shrink-0">
              {(incomingCallInfo.callerId[0] ?? "?").toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500 font-medium">Incoming call</p>
              <p className="text-sm font-semibold text-slate-800 truncate">{incomingCallInfo.callerId}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={acceptCall}
              className="flex-1 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors"
              aria-label="Accept call">Accept</button>
            <button onClick={rejectCall}
              className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
              aria-label="Reject call">Reject</button>
          </div>
        </div>
      )}

      {(callStatus === "connecting" || callStatus === "ringing" || callStatus === "active" || callStatus === "ending") && (
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 w-72">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm flex-shrink-0">
              {(activeContactName[0] ?? "?").toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800 truncate">{activeContactName || "Unknown"}</p>
              <p className="text-xs text-slate-500">
                {callStatus === "connecting" && "Connecting…"}
                {callStatus === "ringing" && "Ringing…"}
                {callStatus === "active" && <span className="text-green-600 font-medium">{formatDuration(timer)}</span>}
                {callStatus === "ending" && "Ending…"}
              </p>
            </div>
          </div>
          {callStatus === "active" && (
            <div className="flex gap-2">
              <button onClick={toggleMute}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isMuted ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
                aria-label={isMuted ? "Unmute" : "Mute"} aria-pressed={isMuted}>
                {isMuted ? "Unmute" : "Mute"}
              </button>
              <button onClick={hangup}
                className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
                aria-label="End call">Hang up</button>
            </div>
          )}
          {(callStatus === "connecting" || callStatus === "ringing") && (
            <button onClick={hangup}
              className="w-full py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
              aria-label="Cancel call">Cancel</button>
          )}
        </div>
      )}
    </div>
  );
}
