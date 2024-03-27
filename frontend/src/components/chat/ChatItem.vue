<script lang="ts" setup>
import type { ChatItem } from '@/types/chat.types'

const props = defineProps<{
  chat: ChatItem
  clickHander?: (chat: ChatItem) => void
}>()

const { setActiveChat } = useChatStore()
const { activeChat } = storeToRefs(useChatStore())

function getUser(chat: ChatItem) {
  if (chat?.chat?.isDM) {
    const reveiver = chat.members.find((member) => member.user.id !== useAuthStore().user.id)
    if (reveiver) chat.chat.name = reveiver?.user.username
    return reveiver?.user
  }
  return undefined
}

function getAvatar(chat: ChatItem) {
  if (chat?.chat?.isDM) {
    const reveiver = chat.members.find((member) => member.user.id !== useAuthStore().user.id)
    return reveiver?.user.avatar
  }
  return '/images/group.png'
}

const _clickHandler = props.clickHander || setActiveChat
</script>

<template>
  <div
    class="chat"
    :class="[
      { 'bg-[#3e3f4595] text-gray-100': activeChat?.chat?.id === chat?.chat?.id },
      chat?.chat?.type,
      { 'has-new-updates': chat?.hasNewUpdates }
    ]"
    @click="_clickHandler(chat)"
  >
    <Avatar
      :user="getUser(chat)"
      :avatar="getAvatar(chat)"
      :popover="chat?.chat?.isDM"
      :status="chat?.chat?.isDM"
      class="sm chat-avatar"
    />
    <div class="chat__info">
      <span class="chat__info__name">{{ chat?.chat?.name }}</span>
      <span class="chat__info__members" v-if="!chat?.chat?.isDM">
        {{ chat?.chat?.type }}
      </span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.chat {
  @apply flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-[#3e3f4595] hover:text-gray-100 cursor-pointer;
  @apply transition-colors duration-300 opacity-80;

  &.has-new-updates {
    @apply text-gray-100 opacity-100;
  }

  &__info {
    @apply flex flex-col justify-center;

    &__name {
      @apply text-base max-w-[160px] truncate;
    }

    &__members {
      @apply text-xs text-gray-400 opacity-60;
    }
  }
}
</style>
