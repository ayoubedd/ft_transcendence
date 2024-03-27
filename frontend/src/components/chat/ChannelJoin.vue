<script lang="ts" setup>
import type { ChatItem } from '@/types/chat.types'
import { LogIn } from 'lucide-vue-next'

const toast = useToast()
const { joinChat } = useChatStore()

defineProps<{
  chat: ChatItem
}>()

const emit = defineEmits(['chat-joined'])

const chatPassword = ref('')
const loading = ref(false)

async function _joinChat(chat: ChatItem) {
  if (chat.chat.type == 'PROTECTED' && !chatPassword.value) return

  try {
    loading.value = true
    await joinChat({ channelId: chat.chat.id, password: chatPassword.value })
    loading.value = false
    toast.success('Chat joined successfully')
    emit('chat-joined')
  } catch (error: any) {
    loading.value = false
    toast.error(error?.message)
  }
}
</script>

<template>
  <ChatItem v-if="chat.chat.isJoined" :chat="chat" />

  <div class="chat-item" v-else>
    <div class="chat-item__info">
      <h4 class="chat-item__info__name">{{ chat?.chat?.name }}</h4>
    </div>
    <div class="chat-item__actions">
      <input
        v-if="chat?.chat?.type == 'PROTECTED' || chat?.chat?.type == 'PRIVATE'"
        type="password"
        class="px-2 h-[26px] w-[110px] text-sm bg-[#35383e] text-gray-300 rounded-sm outline-none"
        placeholder="Password"
        v-model="chatPassword"
      />

      <Button class="h-[26px]" @click="_joinChat(chat)" :loading="loading">
        <LogIn class="w-[18px] h-[18px] stroke-gray-100" />
      </Button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.chat-item {
  @apply flex items-center gap-4;
  @apply pb-2 px-1  my-1;
  @apply border-b-[1px] border-[#35383e];

  &__info {
    @apply flex items-center gap-2 max-w-[120px];
    @apply whitespace-nowrap;
  }

  &__info__name {
    @apply text-gray-300 truncate;
    @apply text-base;
  }

  &__actions {
    @apply flex items-center gap-2 ml-auto;

    & > button {
      @apply flex items-center gap-2;
      @apply bg-[#35383e];
      @apply px-2 py-0;
    }
  }
}
</style>
