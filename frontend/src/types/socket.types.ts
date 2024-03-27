import type { Socket } from 'socket.io-client'

export type Namespace = 'messages' | 'games' | 'users' | 'pong' | 'users'
export interface SocketItem {
  socket: Socket
  connected: boolean
  connecting: boolean
  connect: () => Promise<void>
  disconnect: () => void
  namespace: Namespace
}
