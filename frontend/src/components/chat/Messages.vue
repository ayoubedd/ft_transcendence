<script lang="ts" setup>
import { dateToTimestamp, formatDate } from '@/utils'

const route = useRoute()
const { activeChat } = storeToRefs(useChatStore())
const { fetchChatMessages } = useChatStore()
const messagesContainer = ref<HTMLElement | null>(null)

async function _fetchChatMessages($state: any) {
  if (!activeChat.value) return $state.complete()
  if (activeChat.value.isNewDM) return $state.complete()

  const res = await fetchChatMessages()
  if (res?.length) $state.loaded()
  else $state.complete()
}

const groupedMessages = computed(() => {
  if (!activeChat.value || !activeChat.value.messages.length) return []
  const messages = activeChat.value?.messages || []
  const grouped = []
  let lastMessage = JSON.parse(JSON.stringify(messages[0]))

  for (let i = 1; i < messages.length; i++) {
    const message = JSON.parse(JSON.stringify(messages[i]))
    const lastMessageDate = dateToTimestamp(lastMessage.createdAt)
    const messageDate = dateToTimestamp(message.createdAt)

    if (message.user.id === lastMessage.user.id && messageDate - lastMessageDate < 60 * 1000)
      lastMessage.value += `\n${message.value}`
    else {
      grouped.push(lastMessage)
      lastMessage = message
    }
  }

  grouped.push(lastMessage)
  return grouped
})

async function scrollToBottom() {
  await nextTick()
  const messagesList = document.querySelector('.messages-list')
  messagesList?.scrollTo(0, messagesList.scrollHeight)
}

watch(
  activeChat,
  async () => {
    if (!route.path.includes('chat')) return
    await scrollToBottom()
    // await useChatStore().messagesSeen()
  },
  { deep: true }
)

onMounted(async () => {
  await scrollToBottom()
})
</script>

<template>
  <div class="messages-list" ref="messagesContainer">
    <InfiniteLoading
      :slots="{ complete: ' ' }"
      @infinite="_fetchChatMessages"
      :target="messagesContainer"
      :identifier="activeChat?.chat.id"
      top
      :style="{ minHeight: 'auto' }"
    />
    <div class="messages-list__item" v-for="message in groupedMessages" :key="message.id">
      <AvatartInfoItem :user="message.user" :subinfo="formatDate(message.createdAt)" size="md" />
      <div class="messages-list__content">
        <div class="messages-list__content__message">
          <span
            class="messages-list__content__message__text"
            v-for="(line, i) in message.value.split('\n')"
            :key="i"
          >
            {{ line }}
          </span>
        </div>
      </div>
    </div>

    <p
      v-if="activeChat && !groupedMessages.length"
      class="text-gray-400 h-full flex flex-col items-center justify-center gap-1"
    >
      <span>No messages found</span>
      <span>Be the first to send a message</span>
    </p>

    <div v-if="!activeChat" class="flex items-center justify-center h-full">
      <h4 class="text-lg text-gray-300">Select a chat to start messaging</h4>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.messages-list {
  @apply flex flex-col gap-2;
  @apply pl-4 pr-10 pt-2 pb-6;
  height: calc(100vh - 100px);
  overflow-y: auto;

  &__item {
    @apply flex items-start flex-col gap-2 px-2 py-1 rounded-sm hover:bg-[#0b0b0b1a] hover:text-gray-100;
    @apply transition-colors duration-300;
  }

  &__content {
    @apply flex flex-col justify-center ml-[52px] -mt-1 gap-1;

    &__message {
      @apply flex flex-col items-start gap-1;

      &__text {
        @apply text-gray-300 text-sm break-all;
      }
    }
  }
}
</style>
