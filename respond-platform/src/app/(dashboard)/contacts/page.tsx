import { Topbar } from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { getContacts } from "@/lib/data/contacts";
import { Plus } from "lucide-react";
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
