import { cn, getInitials } from "@/lib/utils";

interface AvatarProps {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg";
  status?: "online" | "busy" | "away" | "offline";
  className?: string;
}

const sizeClasses = { sm: "w-7 h-7 text-xs", md: "w-9 h-9 text-sm", lg: "w-12 h-12 text-base" };
const statusColors = { online: "bg-green-500", busy: "bg-red-500", away: "bg-yellow-500", offline: "bg-slate-400" };

const bgColors = [
  "bg-blue-500", "bg-purple-500", "bg-pink-500", "bg-indigo-500",
  "bg-teal-500", "bg-orange-500", "bg-cyan-500", "bg-rose-500",
];

function colorFromName(name: string) {
  let hash = 0;
  for (const c of name) hash = (hash + c.charCodeAt(0)) % bgColors.length;
  return bgColors[hash];
}

export function Avatar({ name, src, size = "md", status, className }: AvatarProps) {
  return (
    <div className={cn("relative inline-flex shrink-0", className)}>
      <div className={cn("rounded-full flex items-center justify-center text-white font-semibold", sizeClasses[size], src ? "" : colorFromName(name))}>
        {src ? (
          <img src={src} alt={name} className={cn("rounded-full object-cover", sizeClasses[size])} />
        ) : (
          getInitials(name)
        )}
      </div>
      {status && (
        <span className={cn("absolute bottom-0 right-0 rounded-full border-2 border-white", statusColors[status], size === "sm" ? "w-2 h-2" : "w-2.5 h-2.5")} />
      )}
    </div>
  );
}
