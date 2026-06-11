import { Topbar } from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { ChannelIcon } from "@/components/inbox/channel-icon";
import { getContacts } from "@/lib/data/contacts";
import { formatTime, cn } from "@/lib/utils";
import type { Contact } from "@/types";
import { Plus, Phone, Mail, Tag, MessageSquare, MoreVertical } from "lucide-react";
import { ContactsClient } from "./contacts-client";

export default async function ContactsPage() {
  const contacts = await getContacts();
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar
        title="Contacts"
        subtitle={`${contacts.length} contacts`}
        actions={<Button size="sm"><Plus className="w-4 h-4" />New Contact</Button>}
      />
      <ContactsClient contacts={contacts} />
    </div>
  );
}
