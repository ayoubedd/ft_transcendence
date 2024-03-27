<script lang="ts" setup>
import type { ChatMember } from '@/types/chat.types'
import { LogOut } from 'lucide-vue-next'

const toast = useToast()
const { leaveChat } = useChatStore()
const { activeChat } = storeToRefs(useChatStore())
const { user } = storeToRefs(useAuthStore())

const loading = ref(false)

async function _leaveChat() {
  const member = activeChat.value?.members.find((m: ChatMember) => m.user.id === user.value.id)

  let newOwner = ''
  if (member?.role === 'OWNER') {
    newOwner = prompt('Please enter the new owner username') || ''
    if (!newOwner.trim()) return
  } else if (!confirm('Are you sure you want to leave this chat?')) return

  try {
    loading.value = true
    await leaveChat(activeChat.value?.chat.id || '', newOwner)
    loading.value = false
    toast.success('Chat left successfully')
  } catch (error: any) {
    toast.error(error?.message)
    loading.value = false
  }
}
</script>

<template>
  <div class="chat-leave">
    <Button
      class="flex gap-2 items-center border-[1px] border-[#f968684e] px-2 py-1"
      @click="_leaveChat"
      :loading="loading"
    >
      <slot>
        <LogOut class="w-[14px] h-[14px] stroke-red-400" />
        <span class="text-red-400 text-xs font-semibold">Leave</span>
      </slot>
    </Button>
  </div>
</template>
