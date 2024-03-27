<script lang="ts" setup>
import type { ChatMember } from '@/types/chat.types'
import { UserMinus } from 'lucide-vue-next'

const props = defineProps<{
  member: ChatMember
}>()

const toast = useToast()
const { kickFromChat } = useChatStore()
const { activeChat } = storeToRefs(useChatStore())

const kickLoading = ref(false)

async function kickUser() {
  if (!activeChat.value) return
  try {
    if (!window.confirm(`Are you sure you want to kick ${props.member.user.username}?`)) return
    kickLoading.value = true
    await kickFromChat({
      channelId: activeChat.value?.chat.id,
      kickedUserId: props.member.user.id
    })
    kickLoading.value = false
    toast.success('User kicked successfully')
  } catch (error: any) {
    toast.error(error?.message)
    kickLoading.value = false
  }
}
</script>

<template>
  <Button
    :loading="kickLoading"
    @click="kickUser"
    class="px-2 py-0.5 justify-start gap-4 text-red-400 hover:bg-slate-800"
  >
    <UserMinus class="w-[16px] h-[16px]" />
    <span>Kick</span>
  </Button>
</template>
