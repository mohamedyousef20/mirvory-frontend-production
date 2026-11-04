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
    try {
      const permission = await Notification.requestPermission()
      if (permission !== "granted") {
        toast.error("لم يتم السماح بالإشعارات")
        return
      }
      const reg = await navigator.serviceWorker.ready
      const keyRes = await fetch(`${API_URL}/api/push/vapid-public-key`, { credentials: "include" })
      if (!keyRes.ok) throw new Error("missing key")
      const { publicKey } = await keyRes.json()

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      })
      const res = await fetch(`${API_URL}/api/push/subscribe`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      })
      if (!res.ok) throw new Error("subscribe failed")
      setSubscribed(true)
      toast.success("تم تفعيل إشعارات الطلبات على هذا الجهاز")
    } catch {
      toast.error("تعذر تفعيل الإشعارات")
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
