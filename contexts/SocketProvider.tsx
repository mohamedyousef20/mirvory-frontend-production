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
      console.log('Waiting for authentication before connecting socket')
      return
    }

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000'
    console.log('Connecting to socket at:', socketUrl, 'for user:', user._id)

    const newSocket = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket'],
    })

    setSocket(newSocket)

    newSocket.on('connect', () => {
      console.log('Socket connected successfully for user:', user._id)
    })

    newSocket.on('notification', (notif: NotificationPayload) => {
      console.log('Notification received:', notif)
      toast.message(notif.title, {
        description: notif.message,
      })
    })

    newSocket.on('connect_error', (err: Error) => {
      console.error('Connection error:', err)
      toast.error('Connection failed')
    })

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected')
    })

    return () => {
      console.log('Cleaning up socket connection')
      newSocket.disconnect()
    }
  }, [cookiesReady, user])

  return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>
}