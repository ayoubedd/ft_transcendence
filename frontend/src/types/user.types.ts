import type { FriendshipStatus } from './friend.types'

export type UserStatus = 'ONLINE' | 'OFFLINE' | 'INGAME'

export interface User {
  id: string
  firstname: string
  lastname: string
  username: string
  email: string
  bio: string
  avatar: string
  pub: boolean // public profile
  wins: number
  losses: number
  level: number
  lp: number
  status: UserStatus
  '2FA': boolean
  friendship: {
    id: string
    status: FriendshipStatus
  } | null
  createdAt: string
  updatedAt: string
}

export interface BlockedUser {
  id: string
  status: FriendshipStatus
  sender: User
  receiver: User
}

export interface UserPayload {
  firstname: string
  lastname: string
  avatar: string
  bio: string
  pub: true
  email?: string
}
