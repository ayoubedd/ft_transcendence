import type { User } from '@/types/user.types'

export type LiveUpdateType = 'online' | 'offline' | 'ingame' | 'gameInvite'

export interface LiveUpdate {
  type: LiveUpdateType
  message: string
  user: User
  date: string
}

export const useLiveUpdatesStore = defineStore('liveUpdates', () => {
  const liveUpdates = ref<LiveUpdate[]>([])

  function addLiveUpdate(liveUpdate: LiveUpdate) {
    liveUpdates.value.push(liveUpdate)
  }

  return {
    liveUpdates,
    addLiveUpdate
  }
})
