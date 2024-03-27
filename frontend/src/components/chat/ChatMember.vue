<script lang="ts" setup>
import type { ChatMember } from '@/types/chat.types'

const { hasSomePermissions } = useChatPermissions()

const props = defineProps<{
  member: ChatMember
}>()

const _user = computed(() => {
  if (props.member.user.id == useAuthStore().user?.id) return useAuthStore().user
  return props.member.user
})
</script>

<template>
  <div class="chat-member">
    <AvatartInfoItem :user="_user" :subinfo="member.role" :status="true" align="end" />
    <div class="chat-member__actions">
      <ChatMemberActions
        :member="member"
        v-if="member.role != 'OWNER' && hasSomePermissions(member)"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.chat-member {
  @apply flex items-center gap-2 px-1 py-1 rounded-sm hover:bg-[#3e3f4595] hover:text-gray-100 cursor-pointer;
  @apply transition-colors duration-300;

  &:hover .chat-member__actions {
    @apply opacity-100 pointer-events-auto;
  }

  &__username {
    @apply flex flex-col justify-center capitalize;

    &__name {
      @apply text-base;
    }
  }

  &__actions {
    @apply ml-auto opacity-0 pointer-events-none;
    @apply transition-opacity duration-300;
  }

  :global(.btn-role.active) {
    @apply bg-[#6f6f6f85];
  }
}
</style>
