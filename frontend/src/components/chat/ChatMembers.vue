<script lang="ts" setup>
const { activeChat } = storeToRefs(useChatStore())
</script>

<template>
  <div class="chat-members">
    <div class="chat-members__title mt-2" v-if="activeChat && !activeChat.chat.isDM">
      <span class="text-gray-400">Members: {{ activeChat?.members.length }}</span>
    </div>

    <ChatMember
      v-for="member in activeChat?.members"
      :key="member.user.username"
      :member="member"
    />

    <div class="chat-members__title mt-8" v-if="activeChat?.membersBanned.length">
      <span class="text-gray-400 opacity-70">
        Banned Members: {{ activeChat?.membersBanned.length }}
      </span>
    </div>

    <ChatMemberBanned v-for="(member, i) in activeChat?.membersBanned" :key="i" :member="member" />

    <div v-if="!activeChat" class="flex items-center pt-8 flex-col gap-2 h-full">
      <h4 class="text-lg text-gray-300">No members found</h4>
      <p>
        <span class="text-gray-400">Create or join a chat to see members</span>
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.chat-members {
  @apply flex flex-col w-[340px] h-full;
  @apply pl-4 pr-4 py-1;

  &__title {
    @apply text-lg pl-2.5 mb-2 font-medium uppercase text-sm relative;
  }
}
</style>
