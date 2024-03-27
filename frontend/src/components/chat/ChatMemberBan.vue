<script lang="ts" setup>
import type { ChatMember } from '@/types/chat.types'
import { Ban } from 'lucide-vue-next'

const props = defineProps<{
  member: ChatMember
}>()

const toast = useToast()
const { banFromChat } = useChatStore()
const { activeChat } = storeToRefs(useChatStore())

const banLoading = ref(false)

async function banUser() {
  if (!activeChat.value) return
  try {
    if (!window.confirm(`Are you sure you want to ban ${props.member.user.username}?`)) return
    banLoading.value = true
    await banFromChat(props.member, {
      channelId: activeChat.value?.chat.id,
      bannedUserId: props.member.user.id
    })
    banLoading.value = false
    toast.success('User banned successfully')
  } catch (error: any) {
    toast.error(error?.message)
    banLoading.value = false
  }
}
</script>

<template>
  <Button
    :loading="banLoading"
    @click="banUser"
    class="px-2 py-0.5 justify-start gap-4 text-red-400 hover:bg-slate-800"
  >
    <Ban class="w-[16px] h-[16px]" />
    <span>Ban</span>
  </Button>
</template>
