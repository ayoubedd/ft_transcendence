<script lang="ts" setup>
import { QueueingState } from '@/types/pong.types'
import type { MatchState, QueueMsg, PongMatch } from '@/types/pong.types'
import type { User } from '@/types/user.types'
import { getUser } from '@/services/api/users'

const toast = useToast()
const router = useRouter()
const route = useRoute()

const leftUser = ref<User | null>(null)
const rightUser = ref<User | null>(null)
const usersLoading = ref<boolean>(false)
const mode = ref<'queuing' | 'match' | 'spectate'>()
const pongMatch = ref<PongMatch | null>(null)
const match = ref<{ state: MatchState; matchId: string }>({ state: 'starting', matchId: '' })
const queueState = ref<{ state: QueueingState; msg?: string }>({ state: QueueingState.LOADING })
const io = useSocketsStore().create('pong')

const { selectedBoard } = storeToRefs(useGameStore())
const selectedBoardBG = computed(() => `url(${selectedBoard.value?.bg}`)

function addQueueMsgHandler(msg: QueueMsg) {
  switch (msg.status) {
    case 'found': {
      queueState.value.state = QueueingState.FOUND
      mode.value = 'match'
      router.push({ name: 'pong', params: { mode: 'match' } })
      break
    }
    case 'error': {
      queueState.value.state = QueueingState.ERROR
      queueState.value.msg = msg.message
      useGameStore().setGameStatus('ERROR')
      router.push({ name: 'pongOver' })
      break
    }
    case 'timeout': {
      queueState.value.state = QueueingState.TIMEOUT
      useGameStore().setGameStatus('TIMEOUT')
      router.push({ name: 'pongOver' })
      break
    }
  }
}

async function fetchUsers() {
  const leftUserId = pongMatch.value?.leftPlayer?.id
  const rightUserId = pongMatch.value?.rightPlayer?.id

  if (!leftUserId || !rightUserId) return

  let res
  usersLoading.value = true
  res = await getUser(leftUserId)
  if (res.error) return toast.error(res.error?.message)
  leftUser.value = res.data

  res = await getUser(rightUserId)
  if (res.error) return toast.error(res.error?.message)
  rightUser.value = res.data

  usersLoading.value = false
}

async function handleMatchStateUpdate(state: any) {
  if (typeof state != 'object') return

  if (mode.value == 'spectate' && state.state != 'ongoing') await router.push({ name: 'games' })

  pongMatch.value = state
  fetchUsers()
}

onBeforeMount(async () => {
  switch (route.params.mode) {
    case undefined:
    case '':
      mode.value = 'queuing'
      break
    case 'spectate':
      if (typeof route.query.match == 'string') match.value.matchId = route.query.match
      else {
        toast.error('Invalid match id')
        router.push({ name: 'home' })
      }
      mode.value = 'spectate'
      break
    case 'match':
      mode.value = 'match'
      break
    default:
      route.query.error = 'Invalid mode'
      toast.error('Invalid mode')
      router.push({ name: 'home' })
  }
})

onMounted(() => {
  useGameStore().setGameStatus(null)
  switch (mode.value) {
    case 'queuing': {
      io.socket.on('add:queue', addQueueMsgHandler)
      io.socket.emit('add:queue')
      break
    }
  }
})

onBeforeUnmount(() => {
  // Leave Match
  if (match.value.state != 'finished') io.socket.emit('remove:match')

  // Remove client from queue
  if (mode.value == 'queuing' && queueState.value.state === QueueingState.LOADING)
    io.socket.emit('remove:queue')

  io.socket.off('add:queue')
})

onBeforeRouteLeave(() => {
  if (route.query.error) return
  if (
    match.value.state == 'finished' ||
    mode.value == 'spectate' ||
    queueState.value?.state == QueueingState.TIMEOUT ||
    queueState.value?.state == QueueingState.ERROR ||
    useGameStore().gameStatus != null
  )
    return true

  const confirm = window.confirm('Are you sure you want to leave?')
  if (!confirm) return false

  return true
})
</script>

<template>
  <div class="battle-ground-view">
    <div class="battle-ground-view__title">
      <span class="text-gray-400">Battle Ground</span>
    </div>

    <div class="board-container__players" v-if="mode == 'match' || mode == 'spectate'">
      <div
        v-if="leftUser"
        class="board-container__players__left"
        :class="{ me: pongMatch?.myPosition == 'left' }"
      >
        <div v-if="usersLoading">Loading...</div>
        <template v-else>
          <Avatar :user="leftUser" align="start" :status="false" size="lg" />
          <div class="flex flex-col items-start justify-center -mt-1">
            <div class="truncate max-w-[200px]">{{ leftUser.username }}</div>
            <div class="opacity-60 text-sm truncate max-w-[200px]">
              {{ leftUser.firstname }} {{ leftUser.lastname }}
            </div>
          </div>
        </template>
      </div>
      <div
        v-if="rightUser"
        class="board-container__players__right"
        :class="{ me: pongMatch?.myPosition == 'right' }"
      >
        <div v-if="usersLoading">Loading...</div>
        <template v-else>
          <Avatar :user="rightUser" align="end" :status="false" size="lg" />
          <div class="flex flex-col items-starr justify-center -mt-1">
            <div class="truncate max-w-[200px]">{{ rightUser.username }}</div>
            <div class="opacity-60 text-sm truncate max-w-[200px]">
              {{ rightUser.firstname }} {{ rightUser.lastname }}
            </div>
          </div>
        </template>
      </div>
    </div>
    <div class="board-container">
      <div class="board-container__bg" v-if="selectedBoard.bg"></div>

      <div class="board-container__loading" v-if="mode == 'queuing'">
        <div v-if="queueState?.state == QueueingState.TIMEOUT">Timeout</div>
        <div v-else-if="queueState?.state == QueueingState.ERROR">
          {{ queueState.msg ? queueState.msg : 'Error :)' }}
        </div>
        <template v-else>
          <span>Waiting for opponent...</span>
          <Loader3D />
        </template>
      </div>

      <div v-else-if="mode == 'match' || mode == 'spectate'">
        <Pong :mode="mode" :match-id="match.matchId" @match-state-update="handleMatchStateUpdate" />
      </div>

      <div v-else>
        <span>Error of some king</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.battle-ground-view {
  @apply flex flex-col gap-2 w-full h-full items-center justify-center;

  &__title {
    @apply font-medium uppercase text-lg text-gray-400 relative mx-auto;
  }

  .board-container {
    @apply flex w-full h-full max-w-[1400px] max-h-[700px] relative;
    @apply bg-[#44484e] rounded-sm;

    &__players {
      @apply w-full items-center justify-between max-w-[1400px] mx-auto text-gray-200;
      @apply flex flex-row gap-4;

      &__left,
      &__right {
        @apply flex gap-2 items-center justify-start bg-[#40444b] rounded-sm py-2 px-4 w-[280px] h-[80px];

        &.me {
          @apply border-2 border-blue-500;
        }
      }
    }

    &__bg {
      @apply w-full h-full;
      @apply absolute top-0 left-0;
      @apply bg-[#787878] rounded-sm opacity-60;
      background-image: v-bind(selectedBoardBG);
      background-position: center;
    }

    &__content {
      @apply flex flex-col gap-2 w-full h-full items-center justify-center relative;
      @apply z-[2];
    }

    &__loading {
      @apply flex flex-col gap-2 w-full h-full items-center justify-center relative;
      @apply absolute top-0 left-0;
      @apply bg-[#36393e] rounded-sm;

      span {
        @apply font-medium uppercase text-sm text-gray-400 opacity-80 -mt-28;
      }
    }
  }
}
</style>
