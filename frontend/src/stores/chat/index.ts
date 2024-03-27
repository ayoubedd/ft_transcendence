import type {
  ChatAcceptInvitePayload,
  ChatBanPayload,
  ChatCreatePayload,
  ChatInvite,
  ChatInvitePayload,
  ChatJoinPayload,
  ChatKickPayload,
  ChatItem,
  ChatRole,
  ChatMember,
  Chat,
  BannedUser
} from '@/types/chat.types'

import chatAPI from '@/services/api/channels'
import { useStorage } from '@vueuse/core'

export const useChatStore = defineStore('chat', () => {
  const chats = ref<Map<string, ChatItem>>(new Map())
  const newDms = ref<ChatItem[]>([])
  const activeChat = ref<ChatItem | null>(null)
  const activeChatId = useStorage<string>('activeChatId', '', localStorage)

  const chatInvites = ref<ChatInvite[]>([])

  async function setActiveChat(chat?: ChatItem) {
    if (!chat) return (activeChat.value = null)
    if (activeChat.value?.chat.id === chat.chat.id) return
    activeChat.value = chat
    activeChatId.value = chat.chat.id
    activeChat.value.hasNewUpdates = false
    if (!chat.members.length && !chat.isNewDM) await fetchChatMembers()
    if (!chat.membersBanned.length && !chat.chat.isDM) await fetchChatBans()
    if (!chats.value?.get(chat.chat.id)) chats.value?.set(chat.chat.id, chat)
  }

  function pushChatToTop(chat?: ChatItem) {
    if (!chat) return
    chats.value?.delete(chat.chat.id)
    if (activeChat.value?.chat.id !== chat.chat.id) chat.hasNewUpdates = true
    chats.value = new Map([[chat.chat.id, chat], ...chats.value])
  }

  function addNewDM(chat: ChatItem) {
    newDms.value.push(chat)
  }

  async function fetchChats() {
    const { data, error } = await chatAPI.getChannels()
    if (error) return Promise.reject(error)

    const _newChats: Map<string, ChatItem> = new Map(
      data?.map((chat) => [
        chat.id,
        {
          chat,
          members: [],
          membersBanned: [],
          messages: [],
          hasNewUpdates: false
        }
      ])
    )
    for await (const [key, value] of _newChats) {
      if (value.chat.isDM) {
        const { data, error } = await chatAPI.getChannelMembers(key)
        const _members = data.map((m) => ({
          ...m,
          user: { ...m.user, friendship: m.friendship }
        }))
        if (error) return Promise.reject(error)
        value.members = _members
      }
    }
    chats.value = _newChats

    newDms.value.forEach((chat) => {
      chats.value?.set(chat.chat.id, chat)
    })
  }

  async function fetchChatInvites() {
    const { data, error } = await chatAPI.getChannelInvites()
    if (error) return Promise.reject(error)
    chatInvites.value = data

    return data
  }

  async function getChat(channelId: string) {
    if (!chats.value?.has(channelId)) {
      const { data, error } = await chatAPI.getChannel(channelId)
      if (error) return Promise.reject(error)

      const newChat: ChatItem = {
        chat: data,
        members: [],
        membersBanned: [],
        messages: [],
        hasNewUpdates: false
      }

      if (data?.isDM) {
        const { data, error } = await chatAPI.getChannelMembers(channelId)
        const _members = data.map((m) => ({
          ...m,
          user: { ...m.user, friendship: m.friendship }
        }))
        if (error) return Promise.reject(error)
        newChat.members = _members
      }

      chats.value?.set(channelId, newChat)

      return newChat
    }

    return chats.value?.get(channelId)
  }

  async function fetchChatMembers() {
    if (!activeChat.value) return

    const channelId = activeChat.value.chat.id
    const { data, error } = await chatAPI.getChannelMembers(channelId)
    if (error) return Promise.reject(error)

    const _members = data.map((m) => ({
      ...m,
      user: { ...m.user, friendship: m.friendship }
    }))
    activeChat.value.members = _members

    return _members
  }

  async function fetchChatBans() {
    if (!activeChat.value) return

    const channelId = activeChat.value.chat.id
    const { data, error } = await chatAPI.getChannelBans(channelId)
    if (error) return Promise.reject(error)
    activeChat.value.membersBanned = data

    return data
  }

  async function fetchChatMessages(limit = 50) {
    if (!activeChat.value) return

    const channelId = activeChat.value.chat.id
    const offset = activeChat.value.messages.length
    const { data, error } = await chatAPI.getChannelMessages({
      id: channelId,
      limit,
      offset
    })
    if (error) return Promise.reject(error)
    const _messages = data.map((msg) => ({
      ...msg,
      user: { ...msg.user, friendship: msg.friendship }
    }))
    activeChat.value.messages.unshift(..._messages.reverse())

    return data
  }

  async function searchChats(query: string) {
    const { data, error } = await chatAPI.searchChannel({
      limit: 10,
      name: query,
      offset: 0
    })
    if (error) return Promise.reject(error)
    return data
  }

  async function searchMembers(query: string) {
    if (!activeChat.value) return

    return activeChat.value.members.filter((member) =>
      member.user.username.toLowerCase().includes(query.toLowerCase())
    )
  }

  async function inviteToChat(payload: ChatInvitePayload) {
    const { error } = await chatAPI.channelInvite(payload)
    if (error) return Promise.reject(error)
  }

  async function acceptChatInvite(invite: ChatInvite, payload: ChatAcceptInvitePayload) {
    const { error } = await chatAPI.channelAcceptInvite(payload)
    if (error) return Promise.reject(error)

    if (chats.value?.has(payload.channelId)) {
      const chat = chats.value?.get(payload.channelId)
      if (chat) setActiveChat(chat)
      return
    }

    const { data, error: chatError } = await chatAPI.getChannel(payload.channelId)
    if (chatError) return Promise.reject(chatError)

    const chat: ChatItem = {
      chat: data,
      members: [],
      membersBanned: [],
      messages: [],
      hasNewUpdates: false
    }

    setActiveChat(chat)

    chatInvites.value = chatInvites.value.filter((inv) => inv.id !== invite.id)
  }

  async function joinChat(payload: ChatJoinPayload) {
    payload.password = payload.password || undefined
    const { error } = await chatAPI.channelJoin(payload)
    if (error) return Promise.reject(error)

    const { data, error: chatError } = await chatAPI.getChannel(payload.channelId)

    if (chatError) return Promise.reject(chatError)

    const joinedChat = {
      chat: data,
      members: [],
      membersBanned: [],
      messages: [],
      hasNewUpdates: false
    }

    chats.value?.set(data.id, joinedChat)
  }

  async function leaveChat(channelId: string, newOwner?: string) {
    const { error } = await chatAPI.channelLeave(channelId, newOwner)
    if (error) return Promise.reject(error)

    const chat = chats.value?.get(channelId)
    if (!chat) return

    chats.value?.delete(channelId)

    if (activeChat.value?.chat.id === channelId) activeChat.value = null
  }

  async function kickFromChat(payload: ChatKickPayload) {
    const { error } = await chatAPI.channelKick(payload)
    if (error) return Promise.reject(error)

    const chat = chats.value?.get(payload.channelId)
    if (!chat) return

    chat.members = chat.members.filter((member) => member.user.id !== payload.kickedUserId)
  }

  async function banFromChat(member: ChatMember, payload: ChatBanPayload) {
    const { error } = await chatAPI.channelBan(payload)
    if (error) return Promise.reject(error)

    const chat = chats.value?.get(payload.channelId)
    if (!chat) return

    chat.members = chat.members.filter((member) => member.user.id !== payload.bannedUserId)
    chat.membersBanned.push({
      id: member.id,
      channel: member.channel || ({} as Chat),
      muteExpireAt: member.muteExpireAt || new Date(),
      role: member.role || 'USER',
      status: member.status || 'PENDING',
      user: member.user
    })
  }

  async function unbanFromChat(member: BannedUser, payload: ChatBanPayload) {
    const { error } = await chatAPI.channelUnban(payload)
    if (error) return Promise.reject(error)

    const chat = chats.value?.get(payload.channelId)

    if (!chat) return

    chat.membersBanned = chat.membersBanned.filter(
      (banned) => banned.user.id !== payload.bannedUserId
    )
  }

  async function updateMemberRole(userId: string, newRole: ChatRole) {
    const payload = {
      channelId: activeChat.value?.chat.id || '',
      promotedUserId: userId
    }

    const { error } = await chatAPI.promoteMember(payload)
    if (error) return Promise.reject(error)

    const member = activeChat.value?.members.find((member) => member.user.id === userId)
    if (member) member.role = newRole
  }

  async function createChat(payload: ChatCreatePayload) {
    const { data, error } = await chatAPI.createChannel(payload)
    if (error) return Promise.reject(error)

    chats.value?.set(data.id, {
      chat: data,
      members: [],
      membersBanned: [],
      messages: [],
      hasNewUpdates: false
    })

    return data
  }

  async function updateChat(channelId: string, payload: ChatCreatePayload) {
    const { error, data } = await chatAPI.channelUpdate(channelId, payload)
    if (error) return Promise.reject(error)

    const chat = chats.value?.get(channelId)

    if (!chat) return

    chat.chat = data
  }

  async function sendMessage(message: string) {
    if (!activeChat.value) return

    const channelId = activeChat.value.chat.id
    const { data, error } = await chatAPI.channelSendMessage(
      {
        channelId,
        message,
        socketId: useSocketsStore().getSocket('messages')?.socket?.id || ''
      },
      activeChat.value
    )
    if (error) return Promise.reject(error)
    const newMessage = {
      ...data,
      user: useAuthStore().user
    }
    if (activeChat.value?.isNewDM) {
      chats.value?.delete(activeChat.value.chat.id)
      activeChat.value.chat.id = data.channel.id
      chats.value?.set(activeChat.value.chat.id, activeChat.value)
    }

    activeChat.value.messages.push(newMessage)
  }

  async function messageSeen(messageId: string) {
    if (!activeChat.value) return

    const { error } = await chatAPI.messageSeen({ messageId })
    if (error) return Promise.reject(error)

    const message = activeChat.value.messages.find((msg) => msg.id === messageId)
    if (message) message.status = 'READ'
  }

  async function messagesSeen() {
    if (!activeChat.value) return

    const messages = activeChat.value.messages.filter((msg) => msg.status === 'UNREAD')

    try {
      for await (const message of messages) {
        await messageSeen(message.id)
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async function fetchNonChatMembers(query: string) {
    const { data, error } = await chatAPI.getNonChatMembers({
      channelId: activeChat.value?.chat.id || '',
      limit: 20,
      offset: 0,
      query
    })
    if (error) return Promise.reject(error)
    return data
  }

  return {
    chats,
    activeChat,
    activeChatId: readonly(activeChatId),
    chatInvites,
    setActiveChat,
    pushChatToTop,
    addNewDM,
    fetchChats,
    getChat,
    fetchChatMembers,
    fetchChatBans,
    fetchChatInvites,
    fetchChatMessages,
    searchChats,
    searchMembers,
    inviteToChat,
    acceptChatInvite,
    joinChat,
    leaveChat,
    kickFromChat,
    banFromChat,
    updateMemberRole,
    unbanFromChat,
    createChat,
    updateChat,
    sendMessage,
    messageSeen,
    messagesSeen,
    fetchNonChatMembers
  }
})
