import { useFetch } from '@/composables/useFetch'
import type {
  Chat,
  ChatMember,
  ChatMessage,
  ChatInvite,
  ChatCreatePayload,
  ChatBanPayload,
  ChatInvitePayload,
  ChatJoinPayload,
  ChatKickPayload,
  ChatUpdatePayload,
  ChatAcceptInvitePayload,
  chatSendMessagePayload,
  BannedUser,
  ChatItem
} from '@/types/chat.types'
import type { User } from '@/types/user.types'

const BASE_PATH = '/channel'

export async function getChannels() {
  const endpoint = `${BASE_PATH}/recent?limit=100&offset=0`

  return useFetch<Chat[]>(endpoint)
}

export async function getChannel(id: string) {
  const endpoint = `${BASE_PATH}/${id}`

  return useFetch<Chat>(endpoint)
}

export async function getChannelDm(id: string) {
  const endpoint = `${BASE_PATH}/dm/${id}`

  return useFetch<Chat>(endpoint)
}

export async function getBannedUsers() {
  const endpoint = `${BASE_PATH}/ban`

  return useFetch<BannedUser[]>(endpoint)
}

export async function searchChannel(options: { name: string; limit: number; offset: number }) {
  const endpoint = `${BASE_PATH}/search?name=${options.name}&limit=${options.limit}&offset=${options.offset}`

  return useFetch<Chat[]>(endpoint)
}

export async function getChannelMembers(id: string) {
  const endpoint = `${BASE_PATH}/members?channelId=${id}`

  return useFetch<ChatMember[]>(endpoint)
}

export async function getChannelInvites() {
  const endpoint = `${BASE_PATH}/invite`

  return useFetch<ChatInvite[]>(endpoint)
}

export async function getChannelBans(id: string) {
  const endpoint = `${BASE_PATH}/ban?channelId=${id}`

  return useFetch<BannedUser[]>(endpoint)
}

export async function createChannel(payload: ChatCreatePayload) {
  const endpoint = `${BASE_PATH}/create`

  return useFetch<Chat>(endpoint, {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export async function channelUpdate(id: string, payload: ChatUpdatePayload) {
  const endpoint = `${BASE_PATH}/settings`

  const payloadWithId = { ...payload, channelId: id }

  return useFetch<Chat>(endpoint, {
    method: 'POST',
    body: JSON.stringify(payloadWithId)
  })
}

export async function promoteMember(payload: { channelId: string; promotedUserId: string }) {
  const endpoint = `${BASE_PATH}/promote`

  return useFetch<ChatMember>(endpoint, {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export async function channelSendMessage(payload: chatSendMessagePayload, chat?: ChatItem) {
  let endpoint = `/messages`

  if (chat?.chat.isDM) endpoint = `/messages/user`

  const _newPayload = {
    ...payload,
    userId: chat?.members.filter((m) => m.user.id != useAuthStore().user?.id)[0]?.user?.id
  }

  return useFetch<ChatMessage>(endpoint, {
    method: 'POST',
    body: JSON.stringify(_newPayload)
  })
}

export async function channelInvite(payload: ChatInvitePayload) {
  const endpoint = `${BASE_PATH}/invite`

  return useFetch<ChatInvite>(endpoint, {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export async function channelAcceptInvite(payload: ChatAcceptInvitePayload) {
  const endpoint = `${BASE_PATH}/accept`

  return useFetch<ChatInvite>(endpoint, {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export async function channelJoin(payload: ChatJoinPayload) {
  const endpoint = `${BASE_PATH}/join`

  return useFetch<ChatMember>(endpoint, {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export async function channelLeave(id: string, newOwner?: string) {
  const endpoint = `${BASE_PATH}/leave?channelId=${id}${
    newOwner ? '&newOwnerUsername=' + newOwner : ''
  }`

  return useFetch<ChatMember>(endpoint, {
    method: 'DELETE'
  })
}

export async function channelKick(payload: ChatKickPayload) {
  const endpoint = `${BASE_PATH}/kick?channelId=${payload.channelId}&kickedUserId=${payload.kickedUserId}`

  return useFetch<ChatMember>(endpoint, {
    method: 'DELETE'
  })
}

export async function channelBan(payload: ChatBanPayload) {
  const endpoint = `${BASE_PATH}/ban`

  return useFetch<BannedUser>(endpoint, {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export async function channelUnban(payload: ChatBanPayload) {
  const endpoint = `${BASE_PATH}/unban?channelId=${payload.channelId}&bannedUserId=${payload.bannedUserId}`

  return useFetch<ChatMember>(endpoint, {
    method: 'Delete'
  })
}

export async function getChannelMessages(payload: { id: string; limit: number; offset: number }) {
  const endpoint = `/messages?channelId=${payload.id}&limit=${payload.limit}&offset=${payload.offset}`

  return useFetch<ChatMessage[]>(endpoint)
}

export async function messageSeen(payload: { messageId: string }) {
  const endpoint = `/messages/seen`

  return useFetch<ChatMessage>(endpoint, {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export async function getNonChatMembers({
  query,
  channelId,
  limit,
  offset
}: {
  query: string
  channelId: string
  limit: number
  offset: number
}) {
  const endpoint = `${BASE_PATH}/add?channelId=${channelId}&username=${query}&limit=${limit}&offset=${offset}`

  return useFetch<User[]>(endpoint)
}

export default {
  getChannels,
  getChannel,
  searchChannel,
  getChannelMembers,
  getChannelInvites,
  getChannelBans,
  createChannel,
  channelUpdate,
  channelSendMessage,
  channelInvite,
  channelAcceptInvite,
  channelJoin,
  channelKick,
  channelBan,
  promoteMember,
  channelUnban,
  channelLeave,
  getChannelMessages,
  getBannedUsers,
  messageSeen,
  getNonChatMembers,
  getChannelDm
}
