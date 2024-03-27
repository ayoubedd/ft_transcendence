import type {
  Friend,
  FriendAcceptPayload,
  FriendRequestPayload,
  FriendBlockPayload,
  FriendUnblockPayload
} from '@/types/friend.types'

import friendshipsAPI from '@/services/api/friendships'

export type Status = 'all' | 'online' | 'ingame' | 'pending' | 'blocked' | 'banned'

export const useFriendStore = defineStore('friend', () => {
  const friends = ref<Friend[]>([])
  const friendsInGame = ref<Friend[]>([])
  const friendRequests = ref<Friend[]>([])
  const friendBlocks = ref<Friend[]>([])
  const activeStatus = ref<Status>('online')
  const trackedUsersStatus = ref<string[]>([])

  const filteredFriends = computed(() => {
    switch (activeStatus.value) {
      case 'all':
        return friends.value
      case 'online':
        return friends.value.filter((friend) => friend.status === 'ONLINE')
      case 'ingame':
        return friends.value.filter((friend) => friend.status === 'INGAME')
      case 'pending':
        return friendRequests.value
      case 'blocked':
        return friendBlocks.value
      default:
        return []
    }
  })

  function setStatus(newStatus: Status) {
    activeStatus.value = newStatus
  }

  async function fetchFriends(payload: { userId: string; limit: number; offset: number }) {
    const { data, error } = await friendshipsAPI.getFriends(payload)
    if (error) return Promise.reject(error)
    friends.value = data

    return data
  }

  async function fetchFriendsInGame(payload: { userId: string; limit: number; offset: number }) {
    const { data, error } = await friendshipsAPI.getFriends(payload)
    if (error) return Promise.reject(error)

    const _friendsInGame = data.filter((friend) => friend.status === 'INGAME')
    friendsInGame.value.push(..._friendsInGame)

    return _friendsInGame
  }

  async function fetchFriendRequests() {
    const { data, error } = await friendshipsAPI.getFriendRequests()
    if (error) return Promise.reject(error)
    friendRequests.value = data.map((f) => ({
      ...f.sender,
      friendship: { id: f.id, status: f.status }
    }))

    return friendRequests.value
  }

  async function fetchFriendBlocks() {
    const { data, error } = await friendshipsAPI.getBlockedFriends()
    if (error) return Promise.reject(error)
    friendBlocks.value = data.map((f) => ({
      ...f.receiver,
      friendship: { id: f.id, status: f.status }
    }))

    return friendBlocks.value
  }

  async function acceptFriend(payload: FriendAcceptPayload, friend?: Friend) {
    const { data, error } = await friendshipsAPI.acceptFriendRequest(payload)
    if (error) return Promise.reject(error)

    friendRequests.value = friendRequests.value.filter((friend) => friend.id !== payload.him)
    if (friend)
      friends.value.push({
        ...friend,
        friendship: { id: data.id, status: 'ACCEPTED' }
      })

    return data
  }

  async function rejectFriend(friend: Friend, payload: { friendshiId: string }) {
    const { data, error } = await friendshipsAPI.rejectFriendRequest(payload)
    if (error) return Promise.reject(error)

    friendRequests.value = friendRequests.value.filter((f) => f.id !== friend.id)

    return data
  }

  async function requestFriend(payload: FriendRequestPayload) {
    const { data, error } = await friendshipsAPI.sendFriendRequest(payload)
    if (error) return Promise.reject(error)

    return data
  }

  async function requestFriendByUsername(payload: { username: string }) {
    const { data, error } = await friendshipsAPI.sendFriendRequestByUsername(payload)
    if (error) return Promise.reject(error)

    return data
  }

  async function blockFriend(payload: FriendBlockPayload) {
    const { data, error } = await friendshipsAPI.blockFriend(payload)
    if (error) return Promise.reject(error)

    friends.value = friends.value.filter((friend) => friend.id !== payload.him)

    friendRequests.value = friendRequests.value.filter((friend) => friend.id !== payload.him)
    friendBlocks.value.push({ ...data.receiver, friendship: { id: data.id, status: 'BLOCKED' } })

    const { activeProfile } = useProfileStore()
    if (activeProfile)
      activeProfile.friends = activeProfile.friends.filter((friend) => friend.id !== payload.him)
    return data
  }

  async function unblockFriend(payload: FriendUnblockPayload) {
    const { data, error } = await friendshipsAPI.unblockFriend(payload)
    if (error) return Promise.reject(error)
    friendBlocks.value = friendBlocks.value.filter((friend) => friend.id !== payload.him)

    return data
  }

  return {
    friends,
    friendsInGame,
    filteredFriends,
    activeStatus,
    friendRequests,
    friendBlocks,
    trackedUsersStatus,
    fetchFriends,
    fetchFriendsInGame,
    fetchFriendRequests,
    fetchFriendBlocks,
    acceptFriend,
    requestFriend,
    blockFriend,
    unblockFriend,
    setStatus,
    rejectFriend,
    requestFriendByUsername
  }
})
