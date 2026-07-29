"use client";

export type IconName =
  | "bolt" | "users" | "check" | "briefcase" | "card" | "gear"
  | "message" | "star" | "fire" | "tag" | "grid" | "lock" | "arrowRight" | "logout"
  | "calendar" | "clock" | "mapPin" | "shieldCheck" | "send" | "close"
  | "fileText" | "camera" | "package" | "percent" | "plug" | "eye" | "inbox";

export function Icon({ name, size = 18, className = "" }: { name: IconName; size?: number; className?: string }) {
  const common = {
    width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
    className,
  };
  switch (name) {
    case "bolt": return <svg {...common}><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" /></svg>;
    case "users": return <svg {...common}><circle cx="9" cy="8" r="3.2" /><path d="M3.5 20c0-3.5 2.7-6 5.5-6s5.5 2.5 5.5 6" /><circle cx="17.5" cy="9.2" r="2.5" /><path d="M15.3 14.4c2.3.5 4.2 2.6 4.2 5.6" /></svg>;
    case "check": return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="m8 12.3 2.6 2.6L16 9.3" /></svg>;
    case "briefcase": return <svg {...common}><rect x="3" y="8" width="18" height="12" rx="2.2" /><path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M3 13.5h18" /></svg>;
    case "card": return <svg {...common}><rect x="2.5" y="5.5" width="19" height="13" rx="2.2" /><path d="M2.5 10h19" /><path d="M6 15h4" /></svg>;
    case "gear": return <svg {...common}><circle cx="12" cy="12" r="3.2" /><path d="M12 3v2.4M12 18.6V21M4.2 7.5l2.1 1.2M17.7 15.3l2.1 1.2M3 12h2.4M18.6 12H21M4.2 16.5l2.1-1.2M17.7 8.7l2.1-1.2M7.5 4.2l1.2 2.1M15.3 17.7l1.2 2.1M16.5 4.2l-1.2 2.1M8.7 17.7l-1.2 2.1" /></svg>;
    case "message": return <svg {...common}><path d="M4 5.5h16v11H8.5L4 20.5z" /></svg>;
    case "star": return <svg {...common} fill="currentColor" stroke="none"><path d="M12 2.5l2.7 6.1 6.6.6-5 4.4 1.5 6.5L12 16.8 6.2 20l1.5-6.5-5-4.4 6.6-.6L12 2.5Z" /></svg>;
    case "fire": return <svg {...common}><path d="M12 3s-4 3.6-4 7.6A4 4 0 0 0 12 21a4.6 4.6 0 0 0 4.6-4.6c0-2-1-3-1-3s.4 2-1 3c.3-2-1-3.6-1-3.6s.4 2.6-1.6 4.1c-1 .7-1.5 1.7-1.5 2.5" /></svg>;
    case "tag": return <svg {...common}><path d="M11 3H4v7l9.5 9.5a2 2 0 0 0 2.8 0l4.2-4.2a2 2 0 0 0 0-2.8L11 3Z" /><circle cx="8" cy="7" r="1.1" fill="currentColor" stroke="none" /></svg>;
    case "grid": return <svg {...common}><rect x="3" y="3" width="7.5" height="7.5" rx="1.6" /><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.6" /><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.6" /><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.6" /></svg>;
    case "lock": return <svg {...common}><rect x="5" y="10.5" width="14" height="9.5" rx="2.2" /><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" /></svg>;
    case "arrowRight": return <svg {...common}><path d="M4 12h16M14 6l6 6-6 6" /></svg>;
    case "logout": return <svg {...common}><path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" /><path d="M15 16l4-4-4-4" /><path d="M19 12H9" /></svg>;
    case "calendar": return <svg {...common}><rect x="3.5" y="5" width="17" height="15" rx="2.2" /><path d="M3.5 9.5h17" /><path d="M8 3v4M16 3v4" /></svg>;
    case "clock": return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></svg>;
    case "mapPin": return <svg {...common}><path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.3" /></svg>;
    case "shieldCheck": return <svg {...common}><path d="M12 3l7 3v5.5c0 4.8-3 7.9-7 9.5-4-1.6-7-4.7-7-9.5V6l7-3Z" /><path d="m9 12 2.2 2.2L15.5 10" /></svg>;
    case "send": return <svg {...common}><path d="m3 11 18-8-8 18-2.5-7.5L3 11Z" /></svg>;
    case "close": return <svg {...common}><path d="M6 6l12 12M18 6 6 18" /></svg>;
    case "fileText": return <svg {...common}><path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" /><path d="M14 3v5h5" /><path d="M9 13h6M9 16.5h6" /></svg>;
    case "camera": return <svg {...common}><path d="M4 8.5A1.5 1.5 0 0 1 5.5 7H8l1.2-2h5.6L16 7h2.5A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5v-9Z" /><circle cx="12" cy="13" r="3.4" /></svg>;
    case "package": return <svg {...common}><path d="M12 3 4 7.5v9L12 21l8-4.5v-9L12 3Z" /><path d="M4 7.5 12 12l8-4.5" /><path d="M12 12v9" /></svg>;
    case "percent": return <svg {...common}><circle cx="7" cy="7" r="2.3" /><circle cx="17" cy="17" r="2.3" /><path d="M18 6 6 18" /></svg>;
    case "plug": return <svg {...common}><path d="M9 3v5M15 3v5" /><path d="M6.5 8h11v3.5a5.5 5.5 0 0 1-11 0V8Z" /><path d="M12 16.5V21" /></svg>;
    case "eye": return <svg {...common}><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="2.8" /></svg>;
    case "inbox": return <svg {...common}><path d="M3.5 12h5l1.7 3h3.6l1.7-3h5" /><path d="M5.5 5.5h13L21 12v6a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18v-6l2.5-6.5Z" /></svg>;
  }
}

export const AVATAR_GRADIENTS = [
  "linear-gradient(135deg,#8B7CFF,#5B8CFF)",
  "linear-gradient(135deg,#5B8CFF,#6FE0D0)",
  "linear-gradient(135deg,#7CE0A8,#6FE0D0)",
  "linear-gradient(135deg,#F5B93F,#F08A3C)",
  "linear-gradient(135deg,#8B7CFF,#7CE0A8)",
  "linear-gradient(135deg,#6FE0D0,#8B7CFF)",
];

export function Avatar({ id, name, size = 46 }: { id: number; name: string; size?: number }) {
  return (
    <div
      className="rounded-[14px] flex items-center justify-center shrink-0 font-display font-extrabold text-white shadow-[0_4px_12px_-2px_rgba(90,80,220,0.45)]"
      style={{ width: size, height: size, fontSize: size * 0.4, background: AVATAR_GRADIENTS[id % AVATAR_GRADIENTS.length] }}
    >
      {name.charAt(0)}
    </div>
  );
}

export function StatCard({ icon, label, value, sub, color }: { icon: IconName; label: string; value: string; sub: string; color: string }) {
  return (
    <div className="glass-panel rounded-2xl px-5 py-5 flex-1 min-w-[150px]">
      <div className="w-9 h-9 rounded-[10px] flex items-center justify-center mb-3" style={{ background: `${color}22`, color }}>
        <Icon name={icon} size={18} />
      </div>
      <div className="font-display text-[26px] font-extrabold mb-0.5" style={{ color }}>{value}</div>
      <div className="text-xs font-bold text-white mb-0.5">{label}</div>
      <div className="text-[11px] text-white/50">{sub}</div>
    </div>
  );
}

export function StatusPill({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ background: `${color}18`, color, border: `1px solid ${color}40` }}
    >
      {label}
    </span>
  );
}

export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div role="status" className="fixed top-6 right-6 z-[2000] animate-toast-in max-w-[calc(100vw-3rem)]">
      <div className="glass-pill rounded-2xl pl-3 pr-5 py-3 flex items-center gap-3">
        <div className="w-7 h-7 rounded-full bg-[#7CE0A8]/20 flex items-center justify-center shrink-0">
          <Icon name="check" size={15} className="text-[#7CE0A8]" />
        </div>
        <span className="text-[13px] font-bold text-white whitespace-nowrap">{message}</span>
      </div>
    </div>
  );
}

export function Modal({
  onClose,
  children,
  maxWidth = 400,
  ariaLabel,
}: {
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: number;
  ariaLabel?: string;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/65 z-[1000] flex items-center justify-center p-6"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      onClick={onClose}
    >
      <div className="glass-panel rounded-[22px] p-7 w-full" style={{ maxWidth }} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export function StepTracker({ steps, currentIndex, color = "#8B7CFF" }: { steps: string[]; currentIndex: number; color?: string }) {
  return (
    <div className="flex items-center w-full">
      {steps.map((label, i) => (
        <div key={label} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1.5 shrink-0" style={{ width: 64 }}>
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold border-2 shrink-0"
              style={
                i <= currentIndex
                  ? { background: color, borderColor: color, color: "#fff" }
                  : { background: "transparent", borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.4)" }
              }
            >
              {i < currentIndex ? <Icon name="check" size={11} /> : i + 1}
            </div>
            <span
              className="text-[9.5px] font-bold text-center leading-tight"
              style={{ color: i <= currentIndex ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.35)" }}
            >
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className="h-[2px] flex-1 -mt-4"
              style={{ background: i < currentIndex ? color : "rgba(255,255,255,0.1)" }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// Rendered as a sibling ABOVE the aside+main row so it stacks correctly on mobile
// (the aside is display:none there) — do not merge with SideNav into one wrapper.
export function MobileTabBar<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: readonly { id: T; icon: IconName; label: string }[];
  active: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="lg:hidden flex bg-white/[0.02] border-b border-white/10 overflow-x-auto">
      {tabs.map((n) => (
        <button
          key={n.id}
          onClick={() => onChange(n.id)}
          className={`flex-1 min-w-fit px-4 py-3 flex items-center justify-center gap-1.5 border-none text-xs font-bold cursor-pointer whitespace-nowrap ${
            active === n.id ? "bg-[#8B7CFF]/10 text-[#B3A6FF]" : "bg-transparent text-white/50"
          }`}
        >
          <Icon name={n.icon} size={14} />
          {n.label}
        </button>
      ))}
    </div>
  );
}

export function SideNav<T extends string>({
  tabs,
  active,
  onChange,
  footer,
}: {
  tabs: readonly { id: T; icon: IconName; label: string }[];
  active: T;
  onChange: (id: T) => void;
  footer?: React.ReactNode;
}) {
  return (
    <aside className="hidden lg:flex w-[224px] shrink-0 bg-white/[0.015] border-r border-white/10 px-3 py-5 flex-col gap-1 sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto">
      {tabs.map((n) => (
        <button
          key={n.id}
          onClick={() => onChange(n.id)}
          aria-current={active === n.id ? "page" : undefined}
          className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-[11px] border-none text-[13px] font-bold cursor-pointer text-left transition-colors ${
            active === n.id ? "bg-[#8B7CFF]/10 text-[#B3A6FF]" : "bg-transparent text-white/50 hover:text-white"
          }`}
        >
          <Icon name={n.icon} size={16} />
          {n.label}
        </button>
      ))}
      {footer && (
        <>
          <div className="flex-1" />
          {footer}
        </>
      )}
    </aside>
  );
}
