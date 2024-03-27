<script lang="ts" setup>
import type { ChatMessage } from '@/types/chat.types'

const chatSocket = useSocketsStore().getSocket('messages')

chatSocket?.socket.on('message', async ({ data: message }) => {
  const channel = message.channel
  const user = message.user

  const newChatMessage: ChatMessage = {
    id: message.id,
    user: user,
    channel: channel,
    createdAt: message.createdAt,
    friendship: message.friendship,
    status: message.status,
    value: message.value
  }

  const { getChat, pushChatToTop } = useChatStore()

  const chat = await getChat(channel.id)
  if (!chat) return

  chat.hasNewUpdates = true
  pushChatToTop(chat)
  chat?.messages.push(newChatMessage)
})
</script>

<template>
  <div class="hidden"></div>
</template>
