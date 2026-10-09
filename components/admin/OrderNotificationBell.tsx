'use client'

/**
 * OrderNotificationBell
 * Real-time order notifications for admin dashboard via Socket.IO.
 * Plays a short audio chime when a new order arrives.
 * Shows an unread badge and a dropdown list of recent notifications.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'
import type { Socket } from 'socket.io-client'
import { Bell, BellRing, Package, X, Check, CheckCheck } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthProvider'

interface OrderNotif {
  id: string
  orderNumber: string
  customerName?: string
  totalAmount?: number
  itemCount?: number
  createdAt: Date
  read: boolean
}

const MAX_NOTIFICATIONS = 20

// ---------- tiny Web Audio chime (no external file needed) -------------------
function playChime() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, ctx.currentTime)          // A5
    osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.15) // E5
    gain.gain.setValueAtTime(0.4, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.5)
  } catch {
    // browser may block AudioContext without user interaction — silently ignore
  }
}

export function OrderNotificationBell() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<OrderNotif[]>([])
  const [open, setOpen] = useState(false)
  const [audioUnlocked, setAudioUnlocked] = useState(false)
  const [showAudioPrompt, setShowAudioPrompt] = useState(false)
  const socketRef = useRef<Socket | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const seenIdsRef = useRef<Set<string>>(new Set())

  const unreadCount = notifications.filter(n => !n.read).length

  // ── close dropdown on outside click ──────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ── add a new notification (dedup by orderId) ─────────────────────────────
  const addNotification = useCallback((data: any) => {
    const orderId: string = data.orderId || data._id || String(Date.now())
    if (seenIdsRef.current.has(orderId)) return   // already shown
    seenIdsRef.current.add(orderId)

    const notif: OrderNotif = {
      id: orderId,
      orderNumber: data.orderNumber || `#${orderId.slice(-6).toUpperCase()}`,
      customerName: data.customerName || data.guestName || '',
      totalAmount: data.totalAmount,
      itemCount: data.itemCount,
      createdAt: new Date(),
      read: false,
    }

    setNotifications(prev => [notif, ...prev].slice(0, MAX_NOTIFICATIONS))

    // Show sonner toast
    toast.success(`🛒 طلب جديد: ${notif.orderNumber}`, {
      description: notif.customerName ? `العميل: ${notif.customerName}` : undefined,
      duration: 8000,
    })

    // Play chime if audio is unlocked
    if (audioUnlocked) {
      playChime()
    } else {
      setShowAudioPrompt(true)
    }
  }, [audioUnlocked])

  // ── Socket connection (admin only) ────────────────────────────────────────
  useEffect(() => {
    if (!user || user.role !== 'admin') return

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000'
    const socket = io(socketUrl, { withCredentials: true })
    socketRef.current = socket

    socket.on('connect', () => {
      // join admin room if backend supports it
      socket.emit('join-admin-room')
    })

    // Listen for new-order events (backend emits 'newOrder' or 'new-order')
    socket.on('newOrder', addNotification)
    socket.on('new-order', addNotification)
    socket.on('orderCreated', addNotification)

    // Fallback: also catch generic notifications about orders
    socket.on('notification', (data: any) => {
      if (data?.type === 'new_order' || data?.event === 'newOrder') {
        addNotification(data)
      }
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [user, addNotification])

  // ── unlock audio on first user interaction ────────────────────────────────
  const handleUnlockAudio = () => {
    playChime()
    setAudioUnlocked(true)
    setShowAudioPrompt(false)
  }

  const markAllRead = () =>
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))

  const markRead = (id: string) =>
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))

  const clearAll = () => {
    setNotifications([])
    seenIdsRef.current.clear()
  }

  if (!user || user.role !== 'admin') return null

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ── Bell button ── */}
      <button
        onClick={() => { setOpen(o => !o); if (!open) markAllRead() }}
        className="relative p-2 rounded-xl hover:bg-blue-50 transition-colors"
        title={unreadCount > 0 ? `${unreadCount} طلب جديد` : 'الإشعارات'}
      >
        {unreadCount > 0
          ? <BellRing className="h-5 w-5 text-[#1a4fba] animate-pulse" />
          : <Bell className="h-5 w-5 text-slate-500" />
        }
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-0.5 shadow">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Audio unlock prompt ── */}
      {showAudioPrompt && (
        <div className="absolute top-10 end-0 z-50 bg-amber-50 border border-amber-200 rounded-xl p-3 shadow-lg w-64 text-sm">
          <p className="text-amber-800 font-medium mb-2">🔔 تفعيل صوت الإشعارات</p>
          <p className="text-amber-700 text-xs mb-3">انقر لتفعيل نغمة التنبيه عند وصول الطلبات</p>
          <div className="flex gap-2">
            <button onClick={handleUnlockAudio}
              className="flex-1 bg-[#1a4fba] text-white text-xs px-3 py-1.5 rounded-lg font-medium">
              تفعيل الصوت
            </button>
            <button onClick={() => setShowAudioPrompt(false)}
              className="text-slate-400 hover:text-slate-600 p-1">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Dropdown panel ── */}
      {open && (
        <div className="absolute top-10 end-0 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl w-80 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#1a4fba] text-white">
            <span className="font-bold text-sm">إشعارات الطلبات</span>
            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <>
                  <button onClick={markAllRead} title="تحديد الكل كمقروء"
                    className="p-1 hover:bg-white/20 rounded-lg transition">
                    <CheckCheck className="h-4 w-4" />
                  </button>
                  <button onClick={clearAll} title="مسح الكل"
                    className="p-1 hover:bg-white/20 rounded-lg transition">
                    <X className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Notifications list */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p>لا توجد إشعارات جديدة</p>
              </div>
            ) : notifications.map(n => (
              <div key={n.id}
                className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition cursor-pointer ${!n.read ? 'bg-blue-50/40' : ''}`}
                onClick={() => markRead(n.id)}>
                <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${!n.read ? 'bg-[#1a4fba]' : 'bg-slate-200'}`}>
                  <Package className={`h-4 w-4 ${!n.read ? 'text-white' : 'text-slate-500'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    طلب جديد {n.orderNumber}
                  </p>
                  {n.customerName && (
                    <p className="text-xs text-slate-500 truncate">العميل: {n.customerName}</p>
                  )}
                  {n.totalAmount && (
                    <p className="text-xs text-[#1a4fba] font-medium">{n.totalAmount.toLocaleString()} ج.م</p>
                  )}
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {n.createdAt.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {!n.read && (
                  <span className="w-2 h-2 rounded-full bg-[#1a4fba] mt-2 shrink-0" />
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          {!audioUnlocked && (
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100">
              <button onClick={handleUnlockAudio}
                className="w-full text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg py-1.5 font-medium hover:bg-amber-100 transition">
                🔔 تفعيل نغمة الإشعارات
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
