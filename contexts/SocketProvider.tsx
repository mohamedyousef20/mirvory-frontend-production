'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { io, type Socket } from 'socket.io-client'
import { toast } from 'sonner'
import { useAuth } from './AuthProvider'

interface NotificationPayload {
  title: string
  message?: string
}

interface ISocketContext {
  socket: Socket | null
}

const SocketContext = createContext<ISocketContext>({
  socket: null,
})

export const useSocket = () => {
  return useContext(SocketContext)
}

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const { user, cookiesReady } = useAuth()

  useEffect(() => {
    // Only connect when user is authenticated and cookies are ready
    if (!cookiesReady || !user) {
      return
    }

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://pure-courtesy-production-8cb1.up.railway.app'

    const newSocket = io(socketUrl, {
      withCredentials: true,
      // transports: ['websocket'],
    })

    setSocket(newSocket)

    newSocket.on('connect', () => {
      // socket connected
    })

    newSocket.on('notification', (notif: NotificationPayload) => {
      toast.message(notif.title, {
        description: notif.message,
      })
    })

    newSocket.on('connect_error', (err: Error) => {
      console.error('Connection error:', err)
      toast.error('Connection failed')
    })

    newSocket.on('disconnect', () => {
      // socket disconnected
    })

    return () => {
      newSocket.disconnect()
    }
  }, [cookiesReady, user])

  return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>
}