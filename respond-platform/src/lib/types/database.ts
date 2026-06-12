export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

type Rel = { foreignKeyName: string; columns: string[]; isOneToOne: boolean; referencedRelation: string; referencedColumns: string[] }

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.5" }
  public: {
    Tables: {
      ip_automation_rules: {
        Row: { action: string; active: boolean; channel: string; created_at: string; id: string; name: string; runs: number; trigger: string }
        Insert: { action: string; active?: boolean; channel?: string; created_at?: string; id?: string; name: string; runs?: number; trigger: string }
        Update: { action?: string; active?: boolean; channel?: string; created_at?: string; id?: string; name?: string; runs?: number; trigger?: string }
        Relationships: Rel[]
      }
      ip_calls: {
        Row: { agent_id: string | null; contact_id: string | null; conversation_id: string | null; created_at: string; direction: Database["public"]["Enums"]["ip_call_direction"]; duration: number; from_number: string | null; id: string; recording_url: string | null; status: Database["public"]["Enums"]["ip_call_status"]; to_number: string | null; twilio_sid: string | null }
        Insert: { agent_id?: string | null; contact_id?: string | null; conversation_id?: string | null; created_at?: string; direction: Database["public"]["Enums"]["ip_call_direction"]; duration?: number; from_number?: string | null; id?: string; recording_url?: string | null; status?: Database["public"]["Enums"]["ip_call_status"]; to_number?: string | null; twilio_sid?: string | null }
        Update: { agent_id?: string | null; contact_id?: string | null; conversation_id?: string | null; created_at?: string; direction?: Database["public"]["Enums"]["ip_call_direction"]; duration?: number; from_number?: string | null; id?: string; recording_url?: string | null; status?: Database["public"]["Enums"]["ip_call_status"]; to_number?: string | null; twilio_sid?: string | null }
        Relationships: Rel[]
      }
      ip_channel_configs: {
        Row: { created_at: string; credentials: Json; enabled: boolean; id: string; name: string; type: Database["public"]["Enums"]["ip_channel"]; updated_at: string; webhook_url: string | null }
        Insert: { created_at?: string; credentials?: Json; enabled?: boolean; id?: string; name: string; type: Database["public"]["Enums"]["ip_channel"]; updated_at?: string; webhook_url?: string | null }
        Update: { created_at?: string; credentials?: Json; enabled?: boolean; id?: string; name?: string; type?: Database["public"]["Enums"]["ip_channel"]; updated_at?: string; webhook_url?: string | null }
        Relationships: Rel[]
      }
      ip_contacts: {
        Row: { assigned_to: string | null; avatar_url: string | null; channel: Database["public"]["Enums"]["ip_channel"]; created_at: string; custom_fields: Json; email: string | null; external_id: string | null; id: string; last_seen: string | null; name: string; notes: string | null; phone: string | null; status: Database["public"]["Enums"]["ip_contact_status"]; tags: string[] }
        Insert: { assigned_to?: string | null; avatar_url?: string | null; channel: Database["public"]["Enums"]["ip_channel"]; created_at?: string; custom_fields?: Json; email?: string | null; external_id?: string | null; id?: string; last_seen?: string | null; name: string; notes?: string | null; phone?: string | null; status?: Database["public"]["Enums"]["ip_contact_status"]; tags?: string[] }
        Update: { assigned_to?: string | null; avatar_url?: string | null; channel?: Database["public"]["Enums"]["ip_channel"]; created_at?: string; custom_fields?: Json; email?: string | null; external_id?: string | null; id?: string; last_seen?: string | null; name?: string; notes?: string | null; phone?: string | null; status?: Database["public"]["Enums"]["ip_contact_status"]; tags?: string[] }
        Relationships: Rel[]
      }
      ip_conversations: {
        Row: { assigned_to: string | null; channel: Database["public"]["Enums"]["ip_channel"]; contact_id: string; created_at: string; id: string; is_bot: boolean; last_message_id: string | null; status: Database["public"]["Enums"]["ip_conversation_status"]; tags: string[]; unread_count: number; updated_at: string }
        Insert: { assigned_to?: string | null; channel: Database["public"]["Enums"]["ip_channel"]; contact_id: string; created_at?: string; id?: string; is_bot?: boolean; last_message_id?: string | null; status?: Database["public"]["Enums"]["ip_conversation_status"]; tags?: string[]; unread_count?: number; updated_at?: string }
        Update: { assigned_to?: string | null; channel?: Database["public"]["Enums"]["ip_channel"]; contact_id?: string; created_at?: string; id?: string; is_bot?: boolean; last_message_id?: string | null; status?: Database["public"]["Enums"]["ip_conversation_status"]; tags?: string[]; unread_count?: number; updated_at?: string }
        Relationships: Rel[]
      }
      ip_messages: {
        Row: { agent_id: string | null; call_duration: number | null; call_status: Database["public"]["Enums"]["ip_call_status"] | null; content: string; conversation_id: string; created_at: string; external_id: string | null; id: string; media_url: string | null; sender: Database["public"]["Enums"]["ip_message_sender"]; status: Database["public"]["Enums"]["ip_message_delivery"]; type: Database["public"]["Enums"]["ip_message_type"] }
        Insert: { agent_id?: string | null; call_duration?: number | null; call_status?: Database["public"]["Enums"]["ip_call_status"] | null; content?: string; conversation_id: string; created_at?: string; external_id?: string | null; id?: string; media_url?: string | null; sender: Database["public"]["Enums"]["ip_message_sender"]; status?: Database["public"]["Enums"]["ip_message_delivery"]; type?: Database["public"]["Enums"]["ip_message_type"] }
        Update: { agent_id?: string | null; call_duration?: number | null; call_status?: Database["public"]["Enums"]["ip_call_status"] | null; content?: string; conversation_id?: string; created_at?: string; external_id?: string | null; id?: string; media_url?: string | null; sender?: Database["public"]["Enums"]["ip_message_sender"]; status?: Database["public"]["Enums"]["ip_message_delivery"]; type?: Database["public"]["Enums"]["ip_message_type"] }
        Relationships: Rel[]
      }
      ip_phone_numbers: {
        Row: { capabilities: string[]; created_at: string; id: string; is_primary: boolean; label: string | null; number: string }
        Insert: { capabilities?: string[]; created_at?: string; id?: string; is_primary?: boolean; label?: string | null; number: string }
        Update: { capabilities?: string[]; created_at?: string; id?: string; is_primary?: boolean; label?: string | null; number?: string }
        Relationships: Rel[]
      }
      ip_profiles: {
        Row: { auth_user_id: string | null; avatar_url: string | null; created_at: string; email: string; id: string; name: string; role: Database["public"]["Enums"]["ip_agent_role"]; status: Database["public"]["Enums"]["ip_agent_status"] }
        Insert: { auth_user_id?: string | null; avatar_url?: string | null; created_at?: string; email: string; id?: string; name: string; role?: Database["public"]["Enums"]["ip_agent_role"]; status?: Database["public"]["Enums"]["ip_agent_status"] }
        Update: { auth_user_id?: string | null; avatar_url?: string | null; created_at?: string; email?: string; id?: string; name?: string; role?: Database["public"]["Enums"]["ip_agent_role"]; status?: Database["public"]["Enums"]["ip_agent_status"] }
        Relationships: Rel[]
      }
      ip_team_members: {
        Row: { profile_id: string; team_id: string }
        Insert: { profile_id: string; team_id: string }
        Update: { profile_id?: string; team_id?: string }
        Relationships: Rel[]
      }
      ip_teams: {
        Row: { id: string; name: string }
        Insert: { id?: string; name: string }
        Update: { id?: string; name?: string }
        Relationships: Rel[]
      }
      ip_telephony_config: {
        Row: { config: Json; hold_music: string | null; id: string; max_queue_size: number; provider: Database["public"]["Enums"]["ip_telephony_provider"]; record_calls: boolean; updated_at: string; voicemail_enabled: boolean; voicemail_greeting: string | null }
        Insert: { config?: Json; hold_music?: string | null; id?: string; max_queue_size?: number; provider?: Database["public"]["Enums"]["ip_telephony_provider"]; record_calls?: boolean; updated_at?: string; voicemail_enabled?: boolean; voicemail_greeting?: string | null }
        Update: { config?: Json; hold_music?: string | null; id?: string; max_queue_size?: number; provider?: Database["public"]["Enums"]["ip_telephony_provider"]; record_calls?: boolean; updated_at?: string; voicemail_enabled?: boolean; voicemail_greeting?: string | null }
        Relationships: Rel[]
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      ip_current_role: { Args: Record<string, never>; Returns: Database["public"]["Enums"]["ip_agent_role"] }
      ip_is_admin: { Args: Record<string, never>; Returns: boolean }
    }
    Enums: {
      ip_agent_role: "admin" | "supervisor" | "agent"
      ip_agent_status: "online" | "busy" | "away" | "offline"
      ip_call_direction: "inbound" | "outbound"
      ip_call_status: "ringing" | "answered" | "missed" | "voicemail" | "ended"
      ip_channel: "whatsapp" | "line" | "facebook" | "instagram" | "voice" | "sms" | "email"
      ip_contact_status: "active" | "inactive" | "blocked"
      ip_conversation_status: "open" | "pending" | "resolved" | "snoozed"
      ip_message_delivery: "sending" | "sent" | "delivered" | "read" | "failed"
      ip_message_sender: "contact" | "agent" | "bot"
      ip_message_type: "text" | "image" | "file" | "audio" | "video" | "call"
      ip_telephony_provider: "twilio" | "sip" | "plivo" | "vonage"
    }
    CompositeTypes: { [_ in never]: never }
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]

export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T]
