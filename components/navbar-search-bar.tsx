"use client";

/**
 * navbar-search-bar.tsx — شريط البحث الدائم أسفل الـ Navbar
 * - يستخدم خدمة البحث والاقتراحات الموجودة (/api/products/search و /search/suggestions)
 * - يدعم العربية والإنجليزية (الـ API يبحث بالـ regex غير الحساس للحالة)
 * - زر بحث + زر مسح + اقتراحات أثناء الكتابة + حالات تحميل/خطأ/لا نتائج
 * - يمنع الطلبات المتكررة (debounce + AbortController)
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import apiServices from "@/lib/api";

interface Suggestion {
  _id?: string;
  title?: string;
  name?: string;
  slug?: string;
  type?: string;
}

const { api } = apiServices;

export function NavbarSearchBar({ className = "" }: { className?: string }) {
  const { language } = useLanguage();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const controller = useRef<AbortController | null>(null);

  const fallback = language === "ar" ? "فشل تحميل الاقتراحات" : "Could not load suggestions";

  const fetchSuggestions = useCallback(async (term: string) => {
    if (controller.current) controller.current.abort();
    const ctrl = new AbortController();
    controller.current = ctrl;
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/api/products/search/suggestions", {
        params: { q: term, limit: 6 },
        signal: ctrl.signal,
      });
      const data = res.data?.data || res.data?.suggestions || res.data?.products || [];
      setSuggestions(Array.isArray(data) ? data.slice(0, 6) : []);
    } catch (err: any) {
      if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") return;
      setError(fallback);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [fallback]);

  // debounce: لا طلب جديد مع كل ضغطة مفتاح
  useEffect(() => {
    const term = query.trim();
    if (timer.current) clearTimeout(timer.current);
    if (term.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    timer.current = setTimeout(() => fetchSuggestions(term), 350);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [query, fetchSuggestions]);

  const go = (term: string) => {
    const value = term.trim();
    if (!value) return;
    setOpen(false);
    router.push(`/products?q=${encodeURIComponent(value)}`);
  };

  const clear = () => {
    setQuery("");
    setSuggestions([]);
    setError(null);
    setOpen(false);
  };

  return (
    <div className={`relative mx-auto w-full max-w-2xl ${className}`}>
      <form
        role="search"
        onSubmit={(e) => { e.preventDefault(); go(query); }}
        className="relative flex items-center"
      >
        <input
          type="search"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={language === "ar" ? "ابحث عن كوتشياتك المفضلة..." : "Search for your favorite sneakers..."}
          aria-label={language === "ar" ? "بحث" : "Search"}
          className="h-11 w-full rounded-full border border-border bg-background ps-5 pe-24 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
        />
        <div className="absolute end-1.5 flex items-center gap-1">
          {query ? (
            <button
              type="button"
              onClick={clear}
              aria-label={language === "ar" ? "مسح البحث" : "Clear search"}
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
          <button
            type="submit"
            aria-label={language === "ar" ? "بحث" : "Search"}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </button>
        </div>
      </form>

      {open && query.trim().length >= 2 && (
        <div className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border bg-popover shadow-lg">
          {loading ? (
            <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {language === "ar" ? "جاري البحث..." : "Searching..."}
            </div>
          ) : error ? (
            <div className="p-3 text-sm text-destructive">{error}</div>
          ) : suggestions.length === 0 ? (
            <div className="p-3 text-sm text-muted-foreground">
              {language === "ar" ? "لا توجد نتائج مطابقة" : "No matching results"}
            </div>
          ) : (
            <ul className="max-h-80 overflow-auto">
              {suggestions.map((s, i) => {
                const label = s.title || s.name || "";
                if (!label) return null;
                return (
                  <li key={s._id || `${label}-${i}`}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => { setQuery(label); go(label); }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-start text-sm transition hover:bg-muted"
                    >
                      <Search className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="line-clamp-1">{label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default NavbarSearchBar;
