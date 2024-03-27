<script lang="ts" setup>
import type { GameOverStatus } from '@/types/game.types'

const router = useRouter()
const { gameStatus } = storeToRefs(useGameStore())

if (!gameStatus.value) router.push({ name: 'home' })

const messages: Partial<{ [key in GameOverStatus]: string }> = {
  DRAW: 'The game ended in a draw',
  CANCEL: 'Game has been canceled',
  TIMEOUT: 'Queue has timed out',
  ERROR: 'An error occurred'
}
</script>

<template>
  <div class="game-over w-full h-full" v-if="gameStatus">
    <GameVictory v-if="gameStatus === 'VICTORY'" />
    <GameLoss v-else-if="gameStatus === 'DEFEAT'" />

    <div v-else class="flex flex-col items-center justify-center gap-2">
      <h1 v-if="gameStatus == 'DRAW'">Draw</h1>
      <h1 v-if="gameStatus == 'CANCEL'">Game Canceled</h1>
      <h1 v-if="gameStatus == 'TIMEOUT'">Queue Timeout</h1>
      <h1 v-else>Game Over!</h1>

      <p v-if="Object.keys(messages).includes(gameStatus)">{{ messages[gameStatus] }}</p>
    </div>
    <div class="flex flex-col items-center justify-center gap-2 mt-4">
      <RouterLink
        to="/"
        class="text-gray-300 hover:underline w-52 py-1 rounded-sm bg-primary flex justify-center"
      >
        Go Home
      </RouterLink>
      <RouterLink
        :to="{ name: 'pong' }"
        class="text-gray-300 hover:underline w-52 py-1 rounded-sm bg-primary flex justify-center"
      >
        Play Again
      </RouterLink>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.game-over {
  @apply h-full w-full flex flex-col items-center justify-center relative py-12 gap-6;

  h1 {
    @apply text-8xl font-semibold text-gray-100;
  }

  p {
    @apply text-2xl font-medium text-gray-200;
  }

  a {
    @apply text-gray-300 hover:underline;
  }
}
</style>
