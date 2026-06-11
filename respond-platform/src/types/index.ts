export type Channel = "whatsapp" | "line" | "facebook" | "instagram" | "voice" | "sms" | "email";
export type ConversationStatus = "open" | "pending" | "resolved" | "snoozed";
export type ContactStatus = "active" | "inactive" | "blocked";
export type AgentStatus = "online" | "busy" | "away" | "offline";
export type MessageType = "text" | "image" | "file" | "audio" | "video" | "call";
export type CallStatus = "ringing" | "answered" | "missed" | "voicemail" | "ended";

export interface Contact {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  avatar?: string;
  tags: string[];
  status: ContactStatus;
  channel: Channel;
  assignedTo?: string;
  notes?: string;
  createdAt: string;
  lastSeen?: string;
  customFields?: Record<string, string>;
}

export interface Message {
  id: string;
  conversationId: string;
  type: MessageType;
  content: string;
  mediaUrl?: string;
  sender: "contact" | "agent" | "bot";
  agentId?: string;
  agentName?: string;
  timestamp: string;
  status: "sending" | "sent" | "delivered" | "read" | "failed";
  callStatus?: CallStatus;
  callDuration?: number;
}

export interface Conversation {
  id: string;
  contact: Contact;
  channel: Channel;
  status: ConversationStatus;
  assignedTo?: string;
  assignedAgent?: Agent;
  lastMessage?: Message;
  unreadCount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isBot: boolean;
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: AgentStatus;
  role: "admin" | "supervisor" | "agent";
  teams: string[];
}

export interface TelephonyConfig {
  provider: "twilio" | "sip" | "plivo" | "vonage";
  accountSid?: string;
  authToken?: string;
  phoneNumber?: string;
  sipDomain?: string;
  sipUsername?: string;
  sipPassword?: string;
  sipServer?: string;
  sipPort?: string;
  recordCalls: boolean;
  voicemailEnabled: boolean;
  voicemailGreeting?: string;
  maxQueueSize: number;
  holdMusic?: string;
}

export interface ChannelConfig {
  id: string;
  type: Channel;
  name: string;
  enabled: boolean;
  credentials: Record<string, string>;
  webhookUrl?: string;
}

export interface DashboardStats {
  totalConversations: number;
  openConversations: number;
  resolvedToday: number;
  avgResponseTime: number;
  onlineAgents: number;
  totalAgents: number;
  callsToday: number;
  missedCalls: number;
}
