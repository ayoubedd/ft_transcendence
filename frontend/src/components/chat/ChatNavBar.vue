<script lang="ts" setup>
import { MessagesSquare, UserPlus2, PenSquare } from 'lucide-vue-next'

const { activeChat } = storeToRefs(useChatStore())
const { canEdit } = storeToRefs(useChatPermissions())
</script>

<template>
  <div class="chat-navbar">
    <RouterLink :to="{ name: 'chat' }" class="chat-navbar__link">
      <MessagesSquare class="chat-navbar__icon" />
      <span class="mx-2">Chat</span>
      <span>(</span>
      <span class="text-gray-400 max-w-[300px] truncate" v-if="activeChat">
        {{ activeChat?.chat.name }}
      </span>
      <span>)</span>
    </RouterLink>
    <div class="chat-navbar__actions">
      <ChatEdit v-if="activeChat && !activeChat.chat.isDM && canEdit">
        <PenSquare class="w-[22px] h-[22px] stroke-gray-400" />
      </ChatEdit>

      <ChatMembersAdd v-if="canEdit && activeChat && !activeChat.chat.isDM">
        <UserPlus2 class="w-[29px] h-[29px] stroke-gray-400" />
      </ChatMembersAdd>

      <ChatLeave v-if="activeChat && !activeChat.chat.isDM" />
      <MembersSearch v-if="activeChat && !activeChat.chat.isDM" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.chat-navbar {
  @apply h-full flex items-center px-4;

  &__link {
    @apply flex items-center font-medium text-gray-300;
  }

  &__icon {
    @apply w-[22px] stroke-gray-400;
  }

  &__actions {
    @apply ml-auto flex items-center gap-5;
  }
}
</style>
