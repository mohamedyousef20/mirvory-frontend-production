"use client"

/** Account icon that looks different when signed in (initial + green dot) and signed out (outline person, dashed ring). */
export function AccountAvatar({ user, size = 36, tone = "blue" }: { user?: any; size?: number; tone?: "blue" | "soft" }) {
  const raw = user ? String(user.firstName || user.name || user.email || "").trim() : ""
  const initial = raw ? Array.from(raw)[0].toUpperCase() : ""
  const box = { width: size, height: size }
  if (user) {
    return (
      <span style={box} className={`relative inline-flex items-center justify-center rounded-full font-extrabold text-white ring-2 ring-[#dbeafe] ${tone === "soft" ? "bg-[#2563eb]" : "bg-gradient-to-tr from-[#004ac6] to-blue-500"}`}>
        {initial ? <span style={{ fontSize: size * 0.45 }} className="leading-none">{initial}</span> : <span className="material-symbols-outlined" style={{ fontSize: size * 0.55 }}>person</span>}
        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
      </span>
    )
  }
  return (
    <span style={box} className="relative inline-flex items-center justify-center rounded-full bg-white text-slate-500 border border-dashed border-slate-400">
      <span className="material-symbols-outlined" style={{ fontSize: size * 0.55 }}>person</span>
    </span>
  )
}
