import { createClient } from "@/lib/supabase/server";
import type { Contact } from "@/types";

type ContactRow = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  avatar_url: string | null;
  tags: string[];
  status: Contact["status"];
  channel: Contact["channel"];
  assigned_to: string | null;
  notes: string | null;
  custom_fields: unknown;
  created_at: string;
  last_seen: string | null;
};

function mapContact(row: ContactRow): Contact {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone ?? undefined,
    email: row.email ?? undefined,
    avatar: row.avatar_url ?? undefined,
    tags: row.tags,
    status: row.status,
    channel: row.channel,
    assignedTo: row.assigned_to ?? undefined,
    notes: row.notes ?? undefined,
    customFields: (row.custom_fields as Record<string, string>) ?? {},
    createdAt: row.created_at,
    lastSeen: row.last_seen ?? undefined,
  };
}

export async function getContacts(): Promise<Contact[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ip_contacts")
    .select("*")
    .order("name");
  return (data ?? []).map(mapContact);
}

export async function createContact(
  contact: Omit<Contact, "id" | "createdAt">
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ip_contacts")
    .insert({
      name: contact.name,
      phone: contact.phone,
      email: contact.email,
      tags: contact.tags,
      status: contact.status,
      channel: contact.channel,
      assigned_to: contact.assignedTo,
      notes: contact.notes,
    })
    .select()
    .single();
  if (error) throw error;
  return mapContact(data);
}
