'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { io, type Socket } from 'socket.io-client'
import { toast } from 'sonner'

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

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
      withCredentials: true,
      transports: ['websocket'],
    })

    setSocket(newSocket)

    newSocket.on('connect', () => {
      // console.log('Connected')
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

    return () => {
      newSocket.disconnect()
    }
  }, [])

  return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>
}