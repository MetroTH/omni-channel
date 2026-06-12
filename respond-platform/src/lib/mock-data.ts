import type { Contact, Conversation, Message, Agent, DashboardStats } from "@/types";

export const mockAgents: Agent[] = [
  { id: "a1", name: "สมชาย ใจดี", email: "somchai@company.com", status: "online", role: "admin", teams: ["sales", "support"] },
  { id: "a2", name: "วาณี รักงาน", email: "wanee@company.com", status: "online", role: "agent", teams: ["support"] },
  { id: "a3", name: "ประยุทธ์ มั่นคง", email: "prayut@company.com", status: "busy", role: "agent", teams: ["sales"] },
  { id: "a4", name: "สุดา นุ่มนวล", email: "suda@company.com", status: "away", role: "supervisor", teams: ["support", "sales"] },
];

export const mockContacts: Contact[] = [
  { id: "c1", name: "อรุณ สว่างใจ", phone: "0812345678", email: "arun@example.com", tags: ["VIP", "machinery"], status: "active", channel: "line", assignedTo: "a1", createdAt: "2026-01-15T09:00:00Z", lastSeen: "2026-06-08T10:30:00Z" },
  { id: "c2", name: "ปิยะ เจริญดี", phone: "0898765432", tags: ["prospect"], status: "active", channel: "whatsapp", assignedTo: "a2", createdAt: "2026-03-20T14:00:00Z", lastSeen: "2026-06-08T09:15:00Z" },
  { id: "c3", name: "วิภา สุขสันต์", phone: "0756789012", email: "wipa@gmail.com", tags: ["support", "generator"], status: "active", channel: "facebook", createdAt: "2026-04-05T11:00:00Z", lastSeen: "2026-06-07T16:45:00Z" },
  { id: "c4", name: "นคร พัฒนา", phone: "0623456789", tags: ["parts", "VIP"], status: "active", channel: "voice", assignedTo: "a3", createdAt: "2026-02-10T08:00:00Z", lastSeen: "2026-06-08T11:00:00Z" },
  { id: "c5", name: "จันทรา ดาวเด่น", phone: "0945678901", email: "chandra@co.th", tags: ["new"], status: "active", channel: "line", createdAt: "2026-06-01T10:00:00Z", lastSeen: "2026-06-08T08:30:00Z" },
  { id: "c6", name: "สุรชัย ก้าวหน้า", phone: "0834567890", tags: ["prospect", "excavator"], status: "inactive", channel: "whatsapp", createdAt: "2026-05-01T09:00:00Z", lastSeen: "2026-06-05T14:00:00Z" },
];

export const mockMessages: Record<string, Message[]> = {
  conv1: [
    { id: "m1", conversationId: "conv1", type: "text", content: "สวัสดีครับ อยากสอบถามราคารถขุดรุ่น 320 ครับ", sender: "contact", timestamp: "2026-06-08T10:00:00Z", status: "read" },
    { id: "m2", conversationId: "conv1", type: "text", content: "สวัสดีครับ คุณอรุณ ยินดีให้บริการครับ รุ่น 320 มีหลายสเปคครับ ต้องการใช้งานแบบไหนครับ?", sender: "agent", agentName: "สมชาย", timestamp: "2026-06-08T10:02:00Z", status: "read" },
    { id: "m3", conversationId: "conv1", type: "text", content: "งานขุดดินทั่วไปครับ ต้องการเครื่องยนต์ประหยัดน้ำมัน", sender: "contact", timestamp: "2026-06-08T10:05:00Z", status: "read" },
    { id: "m4", conversationId: "conv1", type: "text", content: "แนะนำรุ่น 320 Next Generation ครับ ประหยัดน้ำมันกว่ารุ่นเดิม 20% สนใจให้ส่งใบเสนอราคาได้เลยครับ", sender: "agent", agentName: "สมชาย", timestamp: "2026-06-08T10:08:00Z", status: "delivered" },
  ],
  conv2: [
    { id: "m5", conversationId: "conv2", type: "text", content: "Hello, I need spare parts for CAT 3516 engine", sender: "contact", timestamp: "2026-06-08T09:00:00Z", status: "read" },
    { id: "m6", conversationId: "conv2", type: "text", content: "Hello! Which parts do you need? Please provide the part numbers if available.", sender: "agent", agentName: "วาณี", timestamp: "2026-06-08T09:05:00Z", status: "read" },
  ],
  conv3: [
    { id: "m7", conversationId: "conv3", type: "call", content: "Incoming call", callStatus: "answered", callDuration: 185, sender: "contact", timestamp: "2026-06-08T11:00:00Z", status: "read" },
    { id: "m8", conversationId: "conv3", type: "text", content: "ตามนัดพูดคุยเรื่องซ่อมเครื่องกำเนิดไฟฟ้าครับ", sender: "agent", agentName: "สมชาย", timestamp: "2026-06-08T11:05:00Z", status: "sent" },
  ],
};

export const mockConversations: Conversation[] = [
  {
    id: "conv1", contact: mockContacts[0], channel: "line", status: "open",
    assignedTo: "a1", assignedAgent: mockAgents[0], lastMessage: mockMessages.conv1[3],
    unreadCount: 0, tags: ["sales", "machinery"], createdAt: "2026-06-08T10:00:00Z",
    updatedAt: "2026-06-08T10:08:00Z", isBot: false,
  },
  {
    id: "conv2", contact: mockContacts[1], channel: "whatsapp", status: "open",
    assignedTo: "a2", assignedAgent: mockAgents[1], lastMessage: mockMessages.conv2[1],
    unreadCount: 2, tags: ["parts"], createdAt: "2026-06-08T09:00:00Z",
    updatedAt: "2026-06-08T09:05:00Z", isBot: false,
  },
  {
    id: "conv3", contact: mockContacts[3], channel: "voice", status: "open",
    assignedTo: "a1", assignedAgent: mockAgents[0], lastMessage: mockMessages.conv3[1],
    unreadCount: 1, tags: ["support"], createdAt: "2026-06-08T11:00:00Z",
    updatedAt: "2026-06-08T11:05:00Z", isBot: false,
  },
  {
    id: "conv4", contact: mockContacts[2], channel: "facebook", status: "pending",
    unreadCount: 3, tags: ["generator"], createdAt: "2026-06-07T16:00:00Z",
    updatedAt: "2026-06-07T16:45:00Z", isBot: true,
    lastMessage: { id: "m9", conversationId: "conv4", type: "text", content: "สอบถามเรื่องราคาเครื่องกำเนิดไฟฟ้าค่ะ", sender: "contact", timestamp: "2026-06-07T16:45:00Z", status: "delivered" },
  },
  {
    id: "conv5", contact: mockContacts[4], channel: "line", status: "resolved",
    assignedTo: "a2", assignedAgent: mockAgents[1], unreadCount: 0, tags: ["resolved"],
    createdAt: "2026-06-06T10:00:00Z", updatedAt: "2026-06-07T14:00:00Z", isBot: false,
    lastMessage: { id: "m10", conversationId: "conv5", type: "text", content: "ขอบคุณมากครับ ปัญหาแก้ไขได้แล้ว", sender: "contact", timestamp: "2026-06-07T14:00:00Z", status: "read" },
  },
];

export const mockStats: DashboardStats = {
  totalConversations: 248,
  openConversations: 34,
  resolvedToday: 67,
  avgResponseTime: 4.2,
  onlineAgents: 8,
  totalAgents: 12,
  callsToday: 23,
  missedCalls: 3,
};
