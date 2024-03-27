import { io } from 'socket.io-client'
import type { Socket } from 'socket.io-client'
import type { Namespace } from '@/types/socket.types'

export function createSocket(path: Namespace): Socket {
  return io(`/ws/${path}`, {
    path: `/ws`,
    reconnectionDelayMax: 5000,
    autoConnect: false,
    auth: { token: '' }
  })
}

export async function connectSocket(socket: Socket) {
  const token = await useAuthStore().getToken()

  socket.auth = { token }

  socket.connect()
}

export function disconnectSocket(socket: Socket) {
  socket.disconnect()
}

export default {
  createSocket,
  connectSocket,
  disconnectSocket
}
