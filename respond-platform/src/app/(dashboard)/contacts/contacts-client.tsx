"use client";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { ChannelIcon } from "@/components/inbox/channel-icon";
import { formatTime, cn } from "@/lib/utils";
import type { Contact } from "@/types";
import { Search, Filter, Phone, Mail, Tag, MessageSquare, MoreVertical, ChevronDown } from "lucide-react";

const tagColors = ["bg-blue-100 text-blue-700","bg-green-100 text-green-700","bg-purple-100 text-purple-700","bg-orange-100 text-orange-700","bg-pink-100 text-pink-700","bg-indigo-100 text-indigo-700"];
function tagColor(tag: string) { let h=0; for (const c of tag) h=(h+c.charCodeAt(0))%tagColors.length; return tagColors[h]; }

function ContactDetail({ contact }: { contact: Contact }) {
  return (
    <div className="w-80 border-l border-slate-200 bg-white overflow-y-auto shrink-0">
      <div className="p-6 text-center border-b border-slate-100">
        <Avatar name={contact.name} size="lg" className="mx-auto mb-3" />
        <h2 className="font-semibold text-slate-900 text-lg">{contact.name}</h2>
        {contact.email && <p className="text-sm text-slate-500">{contact.email}</p>}
        <div className="flex justify-center gap-2 mt-4">
          <Button size="sm"><MessageSquare className="w-3.5 h-3.5" />Message</Button>
          <Button variant="outline" size="sm"><Phone className="w-3.5 h-3.5" />Call</Button>
        </div>
      </div>
      <div className="p-4 space-y-4">
        <section>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Contact Info</h3>
          <div className="space-y-2.5">
            {contact.phone && <div className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4 text-slate-400" /><span className="text-slate-700">{contact.phone}</span></div>}
            {contact.email && <div className="flex items-center gap-2 text-sm"><Mail className="w-4 h-4 text-slate-400" /><span className="text-slate-700">{contact.email}</span></div>}
            <div className="flex items-center gap-2 text-sm"><ChannelIcon channel={contact.channel} showLabel size="xs" /></div>
          </div>
        </section>
        <section>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Tags</h3>
          <div className="flex flex-wrap gap-1.5">
            {contact.tags.map((tag) => (
              <span key={tag} className={cn("text-xs rounded-full px-2.5 py-1 font-medium", tagColor(tag))}>
                <Tag className="w-2.5 h-2.5 inline mr-1" />{tag}
              </span>
            ))}
          </div>
        </section>
        <section>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Activity</h3>
          <div className="space-y-1.5 text-sm text-slate-600">
            <div className="flex justify-between"><span>Created</span><span className="text-slate-400">{formatTime(contact.createdAt)}</span></div>
            {contact.lastSeen && <div className="flex justify-between"><span>Last seen</span><span className="text-slate-400">{formatTime(contact.lastSeen)}</span></div>}
            <div className="flex justify-between"><span>Status</span><Badge variant={contact.status === "active" ? "success" : "secondary"}>{contact.status}</Badge></div>
          </div>
        </section>
        {contact.notes && (
          <section>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Notes</h3>
            <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">{contact.notes}</p>
          </section>
        )}
      </div>
    </div>
  );
}

export function ContactsClient({ contacts }: { contacts: Contact[] }) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) || c.email?.toLowerCase().includes(search.toLowerCase())
  );
  const selected = contacts.find((c) => c.id === selectedId);

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3 bg-white border-b border-slate-200">
          <div className="w-72">
            <Input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search contacts..." icon={<Search className="w-3.5 h-3.5" />} className="py-1.5 text-xs" />
          </div>
          <Button variant="outline" size="sm"><Filter className="w-3.5 h-3.5" />Filter</Button>
          <Button variant="outline" size="sm"><Tag className="w-3.5 h-3.5" />Tags <ChevronDown className="w-3 h-3" /></Button>
        </div>
        <div className="flex-1 overflow-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                {["Name","Phone","Channel","Tags","Status","Last Seen",""].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} onClick={() => setSelectedId(c.id === selectedId ? null : c.id)}
                  className={cn("border-b border-slate-100 cursor-pointer transition-colors hover:bg-slate-50", c.id === selectedId && "bg-blue-50")}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={c.name} size="md" />
                      <div><p className="text-sm font-medium text-slate-900">{c.name}</p>{c.email && <p className="text-xs text-slate-400">{c.email}</p>}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{c.phone ?? "—"}</td>
                  <td className="px-4 py-3"><ChannelIcon channel={c.channel} showLabel size="xs" /></td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {c.tags.map((tag) => <span key={tag} className={cn("text-xs rounded-full px-2 py-0.5 font-medium", tagColor(tag))}>{tag}</span>)}
                    </div>
                  </td>
                  <td className="px-4 py-3"><Badge variant={c.status === "active" ? "success" : "secondary"}>{c.status}</Badge></td>
                  <td className="px-4 py-3 text-xs text-slate-400">{c.lastSeen ? formatTime(c.lastSeen) : "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon"><MessageSquare className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="icon"><Phone className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="icon"><MoreVertical className="w-3.5 h-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="flex items-center justify-center h-40 text-slate-400 text-sm">No contacts found</div>}
        </div>
      </div>
      {selected && <ContactDetail contact={selected} />}
    </div>
  );
}
