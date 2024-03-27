<script lang="ts" setup>
import { Plus, Inbox, PackageOpen } from 'lucide-vue-next'

const { chats } = storeToRefs(useChatStore())
</script>

<template>
  <div class="chats-list">
    <div class="chats-list__title flex items-center">
      <span class="text-gray-400">chats</span>
      <div class="ml-auto flex items-center gap-4 pr-1">
        <ChatInvites>
          <Inbox class="w-[20px] h-[20px] stroke-gray-400 mt-[1px]" />
        </ChatInvites>
        <ChatCreate>
          <Plus class="w-5 h-5 cursor-pointer" />
        </ChatCreate>
      </div>
    </div>
    <ChatItem v-for="[chatId, chat] in chats" :key="chatId" :chat="chat" />

    <div v-if="!chats.size" class="text-center mt-4 text-sm px-2 flex flex-col gap-2 opacity-60">
      <span class="flex gap-1 mx-auto">
        <PackageOpen class="w-8 h-8" v-for="i in 3" :key="i" />
      </span>
      <span>No chats has been created yet</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.chats-list {
  @apply flex flex-col gap-1;
  @apply pl-1 pr-1 py-1;

  &__title {
    @apply pl-4 pr-3 mt-2 mb-2 font-medium uppercase text-sm text-gray-400 relative;
  }
}
</style>
