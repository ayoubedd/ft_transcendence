<script lang="ts" setup>
const { fetchChats, setActiveChat } = useChatStore()
const { activeChat, chats, activeChatId } = storeToRefs(useChatStore())

onMounted(async () => {
  await fetchChats()

  if (!activeChat.value) {
    if (chats.value.size) {
      const lastActiveChat =
        chats.value.get(activeChatId.value) || chats.value.entries().next().value[1]

      await setActiveChat(lastActiveChat)
    }
  }
})
</script>

<template>
  <div class="chat-view">
    <Messages />
    <NewMessage v-if="activeChat" />
  </div>
</template>
