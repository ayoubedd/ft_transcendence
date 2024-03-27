<script lang="ts" setup>
import GameAccept from '@/components/games/GameAccept.vue'
import type { User } from '@/types/user.types'

const router = useRouter()
const route = useRoute()
const toast = useToast()
const gameSocket = useSocketsStore().getSocket('pong')

gameSocket?.socket.on('pong:invites', (invite: { id: string; host: User }) => {
  GameAccept.props.invite = invite
  toast.info(GameAccept, { timeout: 30000 })

  useLiveUpdatesStore().addLiveUpdate({
    user: invite.host,
    message: 'invited you to a game of pong',
    type: 'gameInvite',
    date: new Date().toLocaleTimeString()
  })
})

gameSocket?.socket.on('pong:join', () => {
  router.push({ name: 'pong', params: { mode: 'match' } })
})

gameSocket?.socket.on('exception', async (data) => {
  toast.error(`Error: ${data.message}`)
  route.query.error = 'Error: ' + data.message
  await router.push({ name: 'home', query: { error: data.message } })
})
</script>

<template>
  <div class="hidden"></div>
</template>
