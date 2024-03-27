import type { User } from './user.types'

export type FriendshipStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'BLOCKED'

export interface Friend extends User {}

export interface FriendPending {
  id: string
  sender: User
  receiver: User
  status: FriendshipStatus
}

// requests payloads

export interface FriendRequestPayload {
  him: string
}

export interface FriendAcceptPayload {
  him: string
}

export interface FriendBlockPayload {
  him: string
}

export interface FriendUnblockPayload {
  him: string
}
