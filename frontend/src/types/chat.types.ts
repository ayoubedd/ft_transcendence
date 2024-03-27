import type { User } from './user.types'
import type { FriendshipStatus } from './friend.types'

export type ChatType = 'PRIVATE' | 'PUBLIC' | 'PROTECTED'
export type ChatInviteStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED'
export type MessageStatus = 'UNREAD' | 'READ'
export type ChatRole = 'USER' | 'ADMIN' | 'OWNER'

export interface Chat {
  id: string
  name: string
  isDM: boolean
  isJoined: boolean
  type: ChatType
}

export interface ChatInvite {
  id: string
  user: string
  channel: Chat
  status: ChatInviteStatus
  muteExpireAt: Date
  role: ChatRole
}

export interface ChatMember {
  id: string
  user: User
  friendship: {
    id: string
    status: FriendshipStatus
  } | null
  channel: Chat | null
  status: ChatInviteStatus
  muteExpireAt: Date
  role: ChatRole
}

export interface ChatMessage {
  id: string
  value: string
  user: User
  channel: Chat
  status: MessageStatus
  createdAt: string
  friendship: {
    id: string
    status: FriendshipStatus
  }
}

export interface ChatItem {
  chat: Chat
  members: ChatMember[]
  membersBanned: BannedUser[]
  messages: ChatMessage[]
  hasNewUpdates: boolean
  isNewDM?: boolean
}

export interface BannedUser {
  id: string
  user: User
  channel: Chat
  status: ChatInviteStatus
  muteExpireAt: Date
  role: ChatRole
}

// requests payloads

export interface ChatCreatePayload {
  name: string
  type: ChatType
  password?: string
}

export interface chatSendMessagePayload {
  channelId: string
  message: string
  socketId: string
}

export interface ChatUpdatePayload extends Partial<ChatCreatePayload> {}

export interface ChatInvitePayload {
  channelId: string
  receiverId: string
}

export interface ChatAcceptInvitePayload {
  channelId: string
}

export interface ChatBanPayload {
  channelId: string
  bannedUserId: string
}

export interface ChatKickPayload {
  channelId: string
  kickedUserId: string
}

export interface ChatJoinPayload {
  channelId: string
  password?: string
}
