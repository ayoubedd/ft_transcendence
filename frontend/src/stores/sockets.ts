import { createSocket, connectSocket, disconnectSocket } from '@/modules/socketIo'
import type { SocketItem, Namespace } from '@/types/socket.types'

export const useSocketsStore = defineStore('sockets', () => {
  const _sockets: SocketItem[] = []

  const getSocket = (namespace: Namespace): SocketItem | null => {
    const socketItem = _sockets.find((s) => s.namespace === namespace)

    if (socketItem) return socketItem

    return null
  }

  async function disconnectAll() {
    for (const socketItem of _sockets) {
      await socketItem.disconnect()
    }
  }

  async function connectAll() {
    for (const socketItem of _sockets) {
      await socketItem.connect()
    }
  }

  function create(namespace: Namespace): SocketItem {
    const socketItem = _sockets.find((s) => s.namespace === namespace)

    if (socketItem) return socketItem

    const socket = createSocket(namespace)

    const newSoketItem: SocketItem = {
      socket,
      connected: false,
      connecting: false,
      namespace,
      connect: async () => {
        while (newSoketItem.connecting) await new Promise((resolve) => setTimeout(resolve, 500))
        if (newSoketItem.connected) return
        newSoketItem.connecting = true
        await connectSocket(socket)
        _bindConnectionEvents(newSoketItem, namespace)
      },
      disconnect: () => disconnectSocket(socket)
    }
    _sockets.push(newSoketItem)

    return newSoketItem
  }

  function _bindConnectionEvents(socketItem: SocketItem, namespace: Namespace) {
    socketItem.socket.on('connect', () => {
      socketItem.connected = true
      socketItem.connecting = false

      console.log(`Connected to '${namespace}' namespace`)
    })

    socketItem.socket.on('disconnect', () => {
      socketItem.connected = false
      socketItem.connecting = false

      console.log(`Disconnected from '${namespace}' namespace`)
    })

    socketItem.socket.on('connect_error', (err) => {
      socketItem.connected = false
      socketItem.connecting = false

      console.log(`Connection to '${namespace}' namespace failed: ${err.message}`)
    })

    socketItem.socket.on('connect_timeout', () => {
      socketItem.connected = false
      socketItem.connecting = false

      console.log(`Connection timeout to '${namespace}' namespace`)
    })
  }

  return {
    create,
    getSocket,
    connectAll,
    disconnectAll
  }
})
