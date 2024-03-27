<script lang="ts" setup>
import type { ChatMember, ChatRole } from '@/types/chat.types'
import { MoreVertical, UserCog2, UserCheck2, ShieldCheck } from 'lucide-vue-next'

const props = defineProps<{
  member: ChatMember
}>()

const toast = useToast()
const { updateMemberRole } = useChatStore()
const { canPromote } = storeToRefs(useChatPermissions())
const { canKick, canBan } = useChatPermissions()
const { activeChat } = storeToRefs(useChatStore())
const promoteLoading = ref(false)

async function updateRole(newRole: ChatRole) {
  if (!activeChat.value) return
  if (!window.confirm(`Are you sure you want to change role for ${props.member.user.username}?`))
    return

  try {
    promoteLoading.value = true
    await updateMemberRole(props.member.user.id, newRole)
    promoteLoading.value = false
    toast.success('Role updated successfully')
  } catch (error: any) {
    toast.error(error?.message)
    promoteLoading.value = false
  }
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button class="justify-center px-0 py-1 rounded-sm">
        <MoreVertical class="stroke-gray-100" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent class="w-40 flex flex-col gap-1" align="end">
      <ChatMemberKick :member="member" v-if="canKick(member)" />
      <ChatMemberBan :member="member" v-if="canBan(member)" />

      <DropdownMenuSub v-if="member.role == 'USER' && canPromote">
        <DropdownMenuSubTrigger class="flex gap-4 px-3 hover:bg-[#6f6f6f85]">
          <UserCog2 class="w-[16px] h-[16px]" />
          <span>Role</span>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent class="w-32 flex flex-col gap-1" align="end" :side-offset="5">
          <Button
            class="px-2 justify-start gap-4 hover:bg-[#6f6f6f85] btn-role"
            :class="{ active: member.role == 'USER' }"
          >
            <UserCheck2 class="w-[16px] h-[16px]" />
            <span>User</span>
          </Button>
          <Button
            class="px-2 justify-start gap-4 hover:bg-[#6f6f6f85] btn-role"
            @click="updateRole('ADMIN')"
            :loading="promoteLoading"
          >
            <ShieldCheck class="w-[16px] h-[16px]" />
            <span>Admin</span>
          </Button>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
