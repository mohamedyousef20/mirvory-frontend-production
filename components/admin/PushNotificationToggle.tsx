"use client"

/**
 * PushNotificationToggle
 * Lets the admin enable Web Push on this device (works with the installed PWA,
 * even when the site is closed). Subscribes via the service worker in /sw.js
 * and registers the subscription with the backend (/api/push/subscribe).
 */

import { useEffect, useState } from "react"
import { Bell, BellOff } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4)
  const normalized = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/")
  const raw = window.atob(normalized)
  return Uint8Array.from(raw, (c) => c.charCodeAt(0))
}

export function PushNotificationToggle() {
  const [supported, setSupported] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const ok =
      "serviceWorker" in navigator && "PushManager" in window && "Notification" in window
    setSupported(ok)
    if (!ok) return
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setSubscribed(!!sub))
      .catch(() => {})
  }, [])

  const enable = async () => {
    setBusy(true)
    let step = "permission"
    try {
      const permission = await Notification.requestPermission()
      if (permission !== "granted") {
        toast.error("لم يتم السماح بالإشعارات", {
          description: "افتح إعدادات الإشعارات للموقع من المتصفح واسمح بها ثم حاول مرة أخرى.",
        })
        return
      }

      step = "service-worker"
      const reg = await navigator.serviceWorker.ready

      step = "vapid-key"
      const keyRes = await fetch(`${API_URL}/api/push/vapid-public-key`, { credentials: "include" })
      if (keyRes.status === 503) {
        throw new Error("السيرفر لم يُضبط بمفاتيح VAPID بعد (VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY)")
      }
      if (!keyRes.ok) {
        throw new Error(`تعذر الوصول إلى /api/push/vapid-public-key (الحالة ${keyRes.status}). غالبًا الباك إند لم يُنشر بالتحديث بعد`)
      }
      const { publicKey } = await keyRes.json()

      step = "push-subscribe"
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      })

      step = "save-subscription"
      const res = await fetch(`${API_URL}/api/push/subscribe`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      })
      if (!res.ok) {
        throw new Error(`تعذر حفظ الاشتراك في السيرفر (الحالة ${res.status}). تأكد أنك مسجل دخول كأدمن`)
      }
      setSubscribed(true)
      toast.success("تم تفعيل إشعارات الطلبات على هذا الجهاز")
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error(`[push] failed at step "${step}":`, err)
      toast.error("تعذر تفعيل الإشعارات", { description: `${message}` })
    } finally {
      setBusy(false)
    }
  }

  const disable = async () => {
    setBusy(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await fetch(`${API_URL}/api/push/unsubscribe`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        })
        await sub.unsubscribe()
      }
      setSubscribed(false)
      toast.success("تم إيقاف الإشعارات على هذا الجهاز")
    } catch {
      toast.error("تعذر إيقاف الإشعارات")
    } finally {
      setBusy(false)
    }
  }

  if (!supported) return null

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={subscribed ? disable : enable}
      disabled={busy}
      aria-label={subscribed ? "إيقاف إشعارات الطلبات" : "تفعيل إشعارات الطلبات"}
    >
      {subscribed ? <BellOff className="h-4 w-4 ms-2" /> : <Bell className="h-4 w-4 ms-2" />}
      {subscribed ? "إيقاف الإشعارات" : "تفعيل إشعارات الطلبات"}
    </Button>
  )
}
