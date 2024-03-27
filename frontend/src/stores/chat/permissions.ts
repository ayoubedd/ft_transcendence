import type { ChatMember } from '@/types/chat.types'

export const useChatPermissions = defineStore('chatPermissions', () => {
  const canEdit = computed(() => {
    const members = useChatStore().activeChat?.members

    if (!members) return false
    const user = useAuthStore().user
    const loggedInMember = members.find((member) => member.user.id === user?.id)

    if (!loggedInMember) return false

    return loggedInMember.role === 'ADMIN' || loggedInMember.role === 'OWNER'
  })

  const canPromote = computed(() => {
    const members = useChatStore().activeChat?.members

    if (!members) return false
    const user = useAuthStore().user
    const loggedInMember = members.find((member) => member.user.id === user?.id)

    if (!loggedInMember) return false

    return loggedInMember.role === 'OWNER' || loggedInMember.role === 'ADMIN'
  })

  const canKick = (member: ChatMember) => {
    if (member.role === 'OWNER') return false
    const members = useChatStore().activeChat?.members

    if (!members) return false
    const { user } = useAuthStore()
    const loggedInMember = members.find((member) => member.user.id === user?.id)

    if (!loggedInMember) return false

    if (loggedInMember.role === 'OWNER') return true
    if (loggedInMember.role === 'ADMIN' && member.role === 'USER') return true
  }

  const canBan = (member: ChatMember) => {
    if (member.role === 'OWNER') return false
    const members = useChatStore().activeChat?.members

    if (!members) return false
    const { user } = useAuthStore()
    const loggedInMember = members.find((member) => member.user.id === user?.id)

    if (!loggedInMember) return false

    if (loggedInMember.role === 'OWNER') return true
    if (loggedInMember.role === 'ADMIN' && member.role === 'USER') return true
  }

  const hasSomePermissions = (member: ChatMember) => {
    if (member.user.id === useAuthStore().user?.id) return false
    return canPromote.value || canKick(member) || canBan(member)
  }

  return {
    canEdit,
    canPromote,
    canKick,
    canBan,
    hasSomePermissions
  }
})
