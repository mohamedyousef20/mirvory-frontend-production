"use client"

export function youtubeEmbed(url?: string): string | null {
  if (!url) return null
  try {
    const u = new URL(url.trim())
    const host = u.hostname.replace(/^(www\.|m\.)/, "")
    let id: string | null = null
    if (host === "youtu.be") id = u.pathname.slice(1)
    else if (host === "youtube.com" || host === "youtube-nocookie.com") {
      id = u.searchParams.get("v") || u.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]{6,})/)?.[1] || null
    }
    return id && /^[\w-]{6,}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null
  } catch {
    return null
  }
}

/** Product video (YouTube link set per product in admin). Renders nothing for a missing or non-YouTube link. */
export function ProductVideo({ url }: { url?: string }) {
  const src = youtubeEmbed(url)
  if (!src) return null
  return (
    <div dir="rtl" className="[font-family:var(--font-cairo),Cairo,sans-serif]">
      <h3 className="mb-2 px-1 text-[15px] font-extrabold text-slate-900">فيديو المنتج</h3>
      <div className="relative w-full overflow-hidden rounded-2xl bg-slate-900" style={{ paddingBottom: "56.25%" }}>
        <iframe
          src={src}
          title="فيديو المنتج"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="encrypted-media; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    </div>
  )
}
