import { useFetch } from '@/composables/useFetch'
import type {
  Friend,
  FriendPending,
  FriendRequestPayload,
  FriendAcceptPayload,
  FriendBlockPayload,
  FriendUnblockPayload
} from '@/types/friend.types'

const BASE_PATH = '/friendship'

export async function getFriends(payload: { userId: string; limit: number; offset: number }) {
  const endpoint = `${BASE_PATH}/user?limit=${payload.limit}&offset=${payload.offset}&userId=${payload.userId}`

  return useFetch<Friend[]>(endpoint)
}

export async function searchFriends(query: string) {
  const endpoint = `${BASE_PATH}/search?name=${query}&limit=10&offset=0`

  return useFetch<Friend[]>(endpoint)
}

export async function getFriendRequests() {
  const endpoint = `${BASE_PATH}/pending`

  return useFetch<FriendPending[]>(endpoint)
}

export async function getBlockedFriends() {
  const endpoint = `${BASE_PATH}/block`

  return useFetch<FriendPending[]>(endpoint)
}

export async function sendFriendRequest(payload: FriendRequestPayload) {
  const endpoint = `${BASE_PATH}/invite`

  return useFetch<Friend>(endpoint, {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export async function sendFriendRequestByUsername(payload: { username: string }) {
  const endpoint = `${BASE_PATH}/invite/username`

  return useFetch<Friend>(endpoint, {
    body: JSON.stringify(payload),
    method: 'POST'
  })
}

export async function acceptFriendRequest(payload: FriendAcceptPayload) {
  const endpoint = `${BASE_PATH}/accept`

  return useFetch<Friend>(endpoint, {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export async function rejectFriendRequest(payload: { friendshiId: string }) {
  const endpoint = `${BASE_PATH}/reject?friendshipId=${payload.friendshiId}`

  return useFetch<Friend>(endpoint, {
    method: 'DELETE'
  })
}

export async function blockFriend(payload: FriendBlockPayload) {
  const endpoint = `${BASE_PATH}/block`

  return useFetch<FriendPending>(endpoint, {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export async function unblockFriend(payload: FriendUnblockPayload) {
  const endpoint = `${BASE_PATH}/unblock`

  return useFetch<Friend>(endpoint, {
    method: 'DELETE',
    body: JSON.stringify(payload)
  })
}

export default {
  getFriends,
  getFriendRequests,
  sendFriendRequest,
  acceptFriendRequest,
  getBlockedFriends,
  blockFriend,
  unblockFriend,
  searchFriends,
  rejectFriendRequest,
  sendFriendRequestByUsername
}
