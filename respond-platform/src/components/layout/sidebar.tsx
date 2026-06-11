"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, MessageSquare, Users, Phone, Settings,
  Zap, BarChart2, ChevronDown, Plus, Hash, Bot, LogOut
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/conversations", icon: MessageSquare, label: "Inbox" },
  { href: "/contacts", icon: Users, label: "Contacts" },
  { href: "/calls", icon: Phone, label: "Calls" },
  { href: "/automation", icon: Bot, label: "Automation" },
  { href: "/reports", icon: BarChart2, label: "Reports" },
];

const settingsItems = [
  { href: "/settings/telephony", icon: Phone, label: "Telephony" },
  { href: "/settings/channels", icon: Hash, label: "Channels" },
  { href: "/settings/team", icon: Users, label: "Team" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

type Profile = { name: string; status: "online" | "busy" | "away" | "offline" };

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile>({ name: "Loading…", status: "offline" });
  const [unread, setUnread] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("ip_profiles")
          .select("name, status")
          .eq("auth_user_id", user.id)
          .single();
        if (data) setProfile({ name: data.name, status: data.status });
      }
      const { count } = await supabase
        .from("ip_conversations")
        .select("*", { count: "exact", head: true })
        .eq("status", "open")
        .gt("unread_count", 0);
      setUnread(count ?? 0);
    })();

    const channel = supabase.channel("sidebar-unread")
      .on("postgres_changes", { event: "*", schema: "public", table: "ip_conversations" }, async () => {
        const { count } = await supabase
          .from("ip_conversations")
          .select("*", { count: "exact", head: true })
          .eq("status", "open")
          .gt("unread_count", 0);
        setUnread(count ?? 0);
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const setStatus = async (status: Profile["status"]) => {
    setProfile((p) => ({ ...p, status }));
    setMenuOpen(false);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from("ip_profiles").update({ status }).eq("auth_user_id", user.id);
  };

  return (
    <aside className="flex flex-col w-60 bg-slate-900 text-slate-300 h-full shrink-0">
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-slate-700/50">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-white text-lg">InboxPro</span>
      </div>

      <div className="px-3 py-3">
        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors">
          <Plus className="w-4 h-4" />New Conversation
        </button>
      </div>

      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const badge = item.href === "/conversations" ? unread : 0;
          return (
            <Link key={item.href} href={item.href}
              className={cn("flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                isActive ? "bg-slate-700 text-white" : "hover:bg-slate-800 hover:text-white")}>
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {badge > 0 && (
                <span className="bg-blue-600 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">{badge}</span>
              )}
            </Link>
          );
        })}

        <div className="pt-4 pb-1">
          <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Settings</p>
        </div>
        {settingsItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href}
              className={cn("flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                isActive ? "bg-slate-700 text-white" : "hover:bg-slate-800 hover:text-white")}>
              <item.icon className="w-4 h-4 shrink-0" />{item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-3 border-t border-slate-700/50 relative">
        {menuOpen && (
          <div className="absolute bottom-full left-3 right-3 mb-1 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
            {(["online", "busy", "away", "offline"] as const).map((s) => (
              <button key={s} onClick={() => setStatus(s)}
                className={cn("w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-slate-700 capitalize transition-colors",
                  profile.status === s && "bg-slate-700 text-white")}>
                <span className={cn("w-2 h-2 rounded-full", {
                  "bg-green-500": s === "online", "bg-red-500": s === "busy",
                  "bg-yellow-500": s === "away", "bg-slate-400": s === "offline",
                })} />{s}
              </button>
            ))}
            <div className="border-t border-slate-700">
              <button onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-400 hover:bg-slate-700 transition-colors">
                <LogOut className="w-4 h-4" />Sign out
              </button>
            </div>
          </div>
        )}
        <button onClick={() => setMenuOpen(!menuOpen)}
          className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-slate-800 transition-colors">
          <Avatar name={profile.name} size="sm" status={profile.status} />
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-medium text-white truncate">{profile.name}</p>
            <p className={cn("text-xs capitalize", {
              "text-green-400": profile.status === "online", "text-red-400": profile.status === "busy",
              "text-yellow-400": profile.status === "away", "text-slate-400": profile.status === "offline",
            })}>● {profile.status}</p>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
        </button>
      </div>
    </aside>
  );
}
