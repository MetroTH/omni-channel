"use client";
import { useEffect, useState, useCallback } from "react";
import { Topbar } from "@/components/layout/topbar";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChannelIcon } from "@/components/inbox/channel-icon";
import { createClient } from "@/lib/supabase/client";
import { formatTime, cn } from "@/lib/utils";
import type { Conversation, Message } from "@/types";
import {
  Search, Filter, Phone, PhoneCall, Video, MoreVertical,
  Send, Paperclip, Smile, CheckCheck, Check, Bot, User, RefreshCw, MessageSquare
} from "lucide-react";

const statusFilters = ["all", "open", "pending", "resolved", "snoozed"];
const statusVariant: Record<string, "default" | "warning" | "success" | "secondary"> = {
  open: "default", pending: "warning", resolved: "success", snoozed: "secondary",
};

function mapConv(row: Record<string, unknown>): Conversation {
  const ct = row.ip_contacts as Record<string, unknown>;
  const ag = row.assigned_agent as Record<string, unknown> | null;
  const lm = row.last_message as Record<string, unknown> | null;
  return {
    id: row.id as string, channel: row.channel as Conversation["channel"],
    status: row.status as Conversation["status"], assignedTo: row.assigned_to as string ?? undefined,
    assignedAgent: ag ? { id: ag.id as string, name: ag.name as string, email: ag.email as string, status: ag.status as "online", role: ag.role as "agent", teams: [] } : undefined,
    unreadCount: row.unread_count as number, tags: row.tags as string[],
    isBot: row.is_bot as boolean, createdAt: row.created_at as string, updatedAt: row.updated_at as string,
    contact: { id: ct.id as string, name: ct.name as string, phone: ct.phone as string ?? undefined, email: ct.email as string ?? undefined, tags: ct.tags as string[], status: ct.status as "active", channel: ct.channel as Conversation["channel"], customFields: {}, createdAt: ct.created_at as string, lastSeen: ct.last_seen as string ?? undefined },
    lastMessage: lm ? { id: lm.id as string, conversationId: row.id as string, type: lm.type as Message["type"], content: lm.content as string, sender: lm.sender as Message["sender"], timestamp: lm.created_at as string, status: lm.status as Message["status"], callStatus: lm.call_status as Message["callStatus"] ?? undefined, callDuration: lm.call_duration as number ?? undefined } : undefined,
  };
}

function mapMsg(row: Record<string, unknown>): Message {
  return {
    id: row.id as string, conversationId: row.conversation_id as string,
    type: row.type as Message["type"], content: row.content as string,
    mediaUrl: row.media_url as string ?? undefined, sender: row.sender as Message["sender"],
    agentId: row.agent_id as string ?? undefined, timestamp: row.created_at as string,
    status: row.status as Message["status"],
    callStatus: row.call_status as Message["callStatus"] ?? undefined,
    callDuration: row.call_duration as number ?? undefined,
  };
}

function ConversationItem({ conv, isActive, onClick }: { conv: Conversation; isActive: boolean; onClick: () => void }) {
  return (
    <div onClick={onClick} className={cn("flex items-center gap-3 px-4 py-3.5 cursor-pointer border-b border-slate-100 transition-colors",
      isActive ? "bg-blue-50 border-l-2 border-l-blue-600" : "hover:bg-slate-50")}>
      <div className="relative shrink-0">
        <Avatar name={conv.contact.name} size="md" />
        <ChannelIcon channel={conv.channel} className="absolute -bottom-0.5 -right-0.5" size="xs" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <p className={cn("text-sm truncate", conv.unreadCount > 0 ? "font-semibold text-slate-900" : "font-medium text-slate-700")}>{conv.contact.name}</p>
          <span className="text-xs text-slate-400 shrink-0">{formatTime(conv.updatedAt)}</span>
        </div>
        <p className={cn("text-xs truncate mt-0.5", conv.unreadCount > 0 ? "text-slate-700 font-medium" : "text-slate-400")}>{conv.lastMessage?.content ?? "—"}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <Badge variant={statusVariant[conv.status]}>{conv.status}</Badge>
          {conv.isBot && <Badge variant="secondary"><Bot className="w-2.5 h-2.5 mr-0.5" />Bot</Badge>}
        </div>
      </div>
      {conv.unreadCount > 0 && (
        <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shrink-0">{conv.unreadCount}</span>
      )}
    </div>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isAgent = msg.sender === "agent" || msg.sender === "bot";
  if (msg.type === "call") {
    return (
      <div className="flex justify-center my-2">
        <div className="flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2 text-sm text-slate-600">
          <Phone className="w-4 h-4 text-purple-500" />
          <span>{msg.callStatus === "missed" ? "Missed call" : `Call ${msg.callStatus}`}
            {msg.callDuration && ` · ${Math.floor(msg.callDuration / 60)}:${String(msg.callDuration % 60).padStart(2, "0")}`}</span>
        </div>
      </div>
    );
  }
  return (
    <div className={cn("flex gap-2.5 mb-3", isAgent ? "flex-row-reverse" : "flex-row")}>
      {!isAgent && <Avatar name="Contact" size="sm" className="mt-1 shrink-0" />}
      <div className={cn("max-w-[70%] flex flex-col gap-1", isAgent && "items-end")}>
        <div className={cn("px-3 py-2 rounded-2xl text-sm",
          isAgent ? "bg-blue-600 text-white rounded-tr-sm" : "bg-white border border-slate-200 text-slate-900 rounded-tl-sm shadow-sm")}>
          {msg.content}
        </div>
        <div className={cn("flex items-center gap-1 text-xs text-slate-400", isAgent && "flex-row-reverse")}>
          <span>{formatTime(msg.timestamp)}</span>
          {isAgent && (msg.status === "read" ? <CheckCheck className="w-3 h-3 text-blue-500" /> : <Check className="w-3 h-3" />)}
        </div>
      </div>
    </div>
  );
}

export default function ConversationsPage() {
  const supabase = createClient();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    let query = supabase.from("ip_conversations").select(`
      *, ip_contacts(*),
      assigned_agent:ip_profiles!ip_conversations_assigned_to_fkey(*),
      last_message:ip_messages!ip_conversations_last_message_fk(*)
    `).order("updated_at", { ascending: false });
    if (activeFilter !== "all") query = query.eq("status", activeFilter as "open" | "pending" | "resolved" | "snoozed");
    const { data } = await query;
    setConversations((data ?? []).map(mapConv));
    setLoading(false);
  }, [activeFilter]);

  useEffect(() => {
    fetchConversations();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) supabase.from("ip_profiles").select("id").eq("auth_user_id", user.id).single()
        .then(({ data }) => setCurrentProfileId((data as { id: string } | null)?.id ?? null));
    });

    const channel = supabase.channel("conversations-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "ip_conversations" }, () => fetchConversations())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchConversations]);

  const loadMessages = useCallback(async (convId: string) => {
    const { data } = await supabase.from("ip_messages").select("*")
      .eq("conversation_id", convId).order("created_at", { ascending: true });
    setMessages((data ?? []).map(mapMsg));
    await supabase.from("ip_conversations").update({ unread_count: 0 }).eq("id", convId);
  }, []);

  useEffect(() => {
    if (!activeConvId) return;
    loadMessages(activeConvId);
    const channel = supabase.channel(`messages-rt-${activeConvId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "ip_messages", filter: `conversation_id=eq.${activeConvId}` },
        (payload) => setMessages((prev) => [...prev, mapMsg(payload.new as Record<string, unknown>)]))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeConvId, loadMessages]);

  const handleSend = async () => {
    if (!message.trim() || !activeConvId || !currentProfileId) return;
    const content = message;
    setMessage("");
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: activeConvId, content }),
    });
  };

  const handleResolve = async () => {
    if (!activeConvId) return;
    await supabase.from("ip_conversations").update({ status: "resolved" }).eq("id", activeConvId);
  };

  const filtered = conversations.filter((c) => {
    if (search) {
      const q = search.toLowerCase();
      return c.contact.name.toLowerCase().includes(q) || c.lastMessage?.content.toLowerCase().includes(q);
    }
    return true;
  });

  const activeConv = conversations.find((c) => c.id === activeConvId);
  const openCount = conversations.filter((c) => c.status === "open").length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Inbox" subtitle={`${openCount} open conversations`} />
      <div className="flex flex-1 overflow-hidden">

        <div className="w-80 flex flex-col border-r border-slate-200 bg-white shrink-0">
          <div className="p-3 border-b border-slate-100">
            <Input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..." icon={<Search className="w-3.5 h-3.5" />} className="py-1.5 text-xs" />
          </div>
          <div className="flex gap-1 px-3 py-2 overflow-x-auto border-b border-slate-100">
            {statusFilters.map((f) => (
              <button key={f} onClick={() => setActiveFilter(f)}
                className={cn("px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                  activeFilter === f ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
            <Button variant="ghost" size="icon" onClick={fetchConversations} className="ml-auto shrink-0">
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading && <div className="flex items-center justify-center h-20 text-slate-400 text-sm">Loading…</div>}
            {!loading && filtered.length === 0 && <div className="flex items-center justify-center h-20 text-slate-400 text-sm">No conversations</div>}
            {filtered.map((conv) => (
              <ConversationItem key={conv.id} conv={conv} isActive={conv.id === activeConvId} onClick={() => setActiveConvId(conv.id)} />
            ))}
          </div>
        </div>

        {activeConv ? (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3 bg-white border-b border-slate-200 shrink-0">
              <div className="relative">
                <Avatar name={activeConv.contact.name} size="md" />
                <ChannelIcon channel={activeConv.channel} className="absolute -bottom-0.5 -right-0.5" size="xs" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900">{activeConv.contact.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <ChannelIcon channel={activeConv.channel} showLabel size="xs" />
                  {activeConv.contact.phone && <span className="text-xs text-slate-500">{activeConv.contact.phone}</span>}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {activeConv.channel === "voice" && (
                  <><Button variant="ghost" size="icon"><PhoneCall className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon"><Video className="w-4 h-4" /></Button></>
                )}
                <Badge variant={statusVariant[activeConv.status]}>{activeConv.status}</Badge>
                {activeConv.status !== "resolved" && <Button variant="outline" size="sm" onClick={handleResolve}>Resolve</Button>}
                <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-5 bg-slate-50">
              {messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)}
            </div>
            <div className="bg-white border-t border-slate-200 p-3 shrink-0">
              <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 border border-slate-200">
                <Button variant="ghost" size="icon"><Smile className="w-4 h-4 text-slate-400" /></Button>
                <Button variant="ghost" size="icon"><Paperclip className="w-4 h-4 text-slate-400" /></Button>
                <input type="text" value={message} onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }} />
                <Button size="icon" disabled={!message.trim()} onClick={handleSend}><Send className="w-4 h-4" /></Button>
              </div>
              <div className="flex items-center gap-2 mt-2 px-1">
                <Button variant="ghost" size="sm" className="text-xs"><Bot className="w-3.5 h-3.5" />Quick Reply</Button>
                <Button variant="ghost" size="sm" className="text-xs"><User className="w-3.5 h-3.5" />Assign</Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-slate-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Select a conversation</p>
            </div>
          </div>
        )}

        {activeConv && (
          <div className="w-72 border-l border-slate-200 bg-white overflow-y-auto shrink-0 hidden xl:block">
            <div className="p-5 border-b border-slate-100 text-center">
              <Avatar name={activeConv.contact.name} size="lg" className="mx-auto mb-3" />
              <p className="font-semibold text-slate-900">{activeConv.contact.name}</p>
              {activeConv.contact.phone && <p className="text-sm text-slate-500 mt-0.5">{activeConv.contact.phone}</p>}
              <div className="flex justify-center gap-2 mt-3">
                {activeConv.contact.tags.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Details</div>
              {[
                { label: "Channel", value: <ChannelIcon channel={activeConv.channel} showLabel size="xs" /> },
                { label: "Status", value: <Badge variant={statusVariant[activeConv.status]}>{activeConv.status}</Badge> },
                { label: "Assigned", value: activeConv.assignedAgent?.name ?? "Unassigned" },
                { label: "Created", value: formatTime(activeConv.createdAt) },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-500">{label}</span>
                  <span className="text-xs text-slate-900 font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
