"use client"

export function youtubeInfo(url?: string): { src: string; short: boolean } | null {
  if (!url) return null
  try {
    let raw = url.trim()
    if (!/^https?:\/\//i.test(raw)) raw = "https://" + raw
    const u = new URL(raw)
    const host = u.hostname.replace(/^(www\.|m\.)/, "")
    let id: string | null = null
    let short = false
    if (host === "youtu.be") id = u.pathname.split("/")[1] || null
    else if (host === "youtube.com" || host === "youtube-nocookie.com" || host === "music.youtube.com") {
      short = /^\/shorts\//.test(u.pathname)
      id = u.searchParams.get("v") || u.pathname.match(/^\/(?:embed|shorts|live|v)\/([\w-]{6,})/)?.[1] || null
    }
    return id && /^[\w-]{6,}$/.test(id) ? { src: `https://www.youtube-nocookie.com/embed/${id}?rel=0&playsinline=1`, short } : null
  } catch {
    return null
  }
}

export function youtubeEmbed(url?: string): string | null {
  return youtubeInfo(url)?.src ?? null
}

/** Product video (YouTube link set per product in admin). Renders nothing for a missing or non-YouTube link. */
export function ProductVideo({ url }: { url?: string }) {
  const info = youtubeInfo(url)
  if (!info) return null
  const { src, short } = info
  return (
    <div dir="rtl" className="[font-family:var(--font-cairo),Cairo,sans-serif]">
      <h3 className="mb-2 px-1 text-[15px] font-extrabold text-slate-900">فيديو المنتج</h3>
      <div
        className={`relative overflow-hidden rounded-2xl bg-slate-900 ${short ? "mx-auto w-[min(100%,320px)]" : "w-full"}`}
        style={{ paddingBottom: short ? "177.78%" : "56.25%" }}
      >
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
