<script lang="ts" setup>
import type { ChatInvite } from '@/types/chat.types'
import { PlusCircle } from 'lucide-vue-next'

const toast = useToast()
const { acceptChatInvite } = useChatStore()
const props = defineProps<{
  invite: ChatInvite
}>()

const loading = ref(false)

async function _joinChat() {
  try {
    loading.value = true
    await acceptChatInvite(props.invite, { channelId: props.invite.channel.id })
    loading.value = false
    toast.success('Chat joined successfully')
  } catch (error: any) {
    loading.value = false
    toast.error(error?.message)
  }
}
</script>

<template>
  <div class="chat-invite">
    <div class="chat-invite__info">
      <h4 class="chat-invite__info__name">{{ invite?.channel?.name }}</h4>
    </div>
    <div class="chat-invite__actions">
      <Button class="btn btn-primary" @click="_joinChat" :loading="loading">
        <PlusCircle class="w-[18px] h-[18px] stroke-gray-100" />
        <span>Join</span>
      </Button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.chat-invite {
  @apply flex items-center gap-4;
  @apply pb-2 px-1  my-1;
  @apply border-b-2 border-[#35383e];

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
