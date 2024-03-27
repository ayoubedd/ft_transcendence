import type { User } from '@/types/user.types'
import type { Friend } from '@/types/friend.types'
import type { Game } from '@/types/game.types'

import profileAPI from '@/services/api/profile'
import friendshipsAPI from '@/services/api/friendships'
import gamesAPI from '@/services/api/games'

export interface Profile {
  user: User
  friends: Friend[]
  games: Game[]
}

export const useProfileStore = defineStore('profile', () => {
  const profiles = ref<Map<string, Profile>>(new Map())
  const activeProfile = ref<Profile | null>(null)
  const MAX_PROFILES_STORED = 10

  async function setNewProfile(profile: Profile) {
    if (profiles.value.size >= MAX_PROFILES_STORED) {
      const firstKey = profiles.value.keys().next().value
      profiles.value.delete(firstKey)
    }

    profiles.value.set(profile.user.username, profile)
  }

  async function fetchProfile(userId: string) {
    if (profiles.value.has(userId)) return

    const { data, error } = await profileAPI.getProfile(userId)
    if (error) return Promise.reject(error)
    setNewProfile({
      user: data,
      friends: [],
      games: []
    })

    return data
  }

  async function fetchProfileByUsername(username: string) {
    const { data, error } = await profileAPI.getProfileByUsername(username)
    if (error) return Promise.reject(error)
    setNewProfile({
      user: data,
      friends: [],
      games: []
    })

    return data
  }

  async function setActiveProfile(username?: string) {
    if (activeProfile.value && activeProfile.value?.user.username === username) return

    if (!username) {
      if (profiles.value.has(useAuthStore().user.username))
        return (activeProfile.value = profiles.value.get(useAuthStore().user.username) || null)

      const user = useAuthStore().user
      const profile: Profile = {
        user,
        friends: [],
        games: []
      }

      setNewProfile(profile)
      activeProfile.value = profile
      return
    }
    if (!profiles.value.has(username)) await fetchProfileByUsername(username)
    activeProfile.value = profiles.value.get(username) || null
  }

  async function updateProfile(data: Partial<User>) {
    const { data: user, error } = await profileAPI.updateProfile(data)
    if (error) return Promise.reject(error)

    useAuthStore().updateUser(user)
    const profile = profiles.value.get(user.username)
    if (profile) profile.user = user
  }

  async function uploadAvatar(file: File) {
    const { data: user, error } = await profileAPI.uploadAvatar(file)
    if (error) return Promise.reject(error)

    useAuthStore().updateUser(user)
    const profile = profiles.value.get(user.username)
    if (profile) profile.user.avatar = user.avatar
  }

  async function fetchFriends(payload: {
    userId: string
    username: string
    limit: number
    offset: number
  }) {
    const { data, error } = await friendshipsAPI.getFriends(payload)
    if (error) return Promise.reject(error)
    profiles.value.get(payload.username)?.friends.push(...data)

    return data
  }

  async function fetchGames(payload: {
    userId: string
    username: string
    offset: number
    limit: number
  }) {
    const { data, error } = await gamesAPI.getGames(payload)
    if (error) return Promise.reject(error)
    profiles.value.get(payload.username)?.games.push(...data)

    return data
  }

  return {
    profiles,
    activeProfile,
    fetchProfile,
    fetchProfileByUsername,
    setActiveProfile,
    updateProfile,
    uploadAvatar,
    fetchFriends,
    fetchGames
  }
})
