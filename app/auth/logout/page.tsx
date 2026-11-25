"use client"
import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthProvider"

/** /auth/logout: signs the user out, then sends them to the login page. */
export default function LogoutPage() {
  const router = useRouter()
  const { logout } = useAuth()
  const done = useRef(false)
  useEffect(() => {
    if (done.current) return
    done.current = true
    ;(async () => {
      try {
        await logout()
      } finally {
        router.replace("/auth/login")
      }
    })()
  }, [logout, router])
  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center bg-[#f7f9fb] font-[Cairo,sans-serif] text-sm font-semibold text-slate-600">
      جاري تسجيل الخروج...
    </div>
  )
}
