<script lang="ts" setup>
import type { BannedUser } from '@/types/chat.types'

const props = defineProps<{
  member: BannedUser
}>()

const { unbanFromChat } = useChatStore()
const { activeChat } = storeToRefs(useChatStore())
const toast = useToast()

const loading = ref(false)
const _user = computed(() => {
  if (props.member.user.id == useAuthStore().user?.id) return useAuthStore().user
  return props.member.user
})

async function _unbanMember() {
  if (!confirm('Are you sure you want to unban this member?')) return
  try {
    loading.value = true
    await unbanFromChat(props.member, {
      bannedUserId: props.member.user.id,
      channelId: activeChat.value?.chat.id || ''
    })
    loading.value = false
    toast.success('Member unbanned successfully')
  } catch (error: any) {
    toast.error(error?.message)
    loading.value = false
  }
}
</script>

<template>
  <div class="chat-member">
    <AvatartInfoItem :user="_user" :subinfo="member.role" :status="true" align="end" />
    <div class="chat-member__actions opacity-0 ml-auto mr-2">
      <Button
        class="flex gap-2 items-center border-[1px] border-[#f968684e] px-2 py-1 text-sm text-red-400"
        :loading="loading"
        @click="_unbanMember"
      >
        <span>Unban</span>
      </Button>
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
}
</style>
