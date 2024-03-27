<script lang="ts" setup>
import type { Game } from '@/types/game.types'
import type { User } from '@/types/user.types'

const props = defineProps<{
  game: Game
}>()

const isDraw = computed(() => props.game.looserScore == props.game.winnerScore)

function isWinner(user: User) {
  return user?.id == props.game?.winner?.id
}

function getScore(user: User) {
  return user?.id == props.game?.winner?.id ? props.game?.winnerScore : props.game?.looserScore
}
</script>

<template>
  <div class="game-card">
    <div class="game-card__user">
      <AvatartInfoItem :user="game.user" :status="false" :popover="false" />
    </div>
    <div class="game-card__status">
      <span class="score" :class="{ winner: isWinner(game.user) }">
        {{ getScore(game.user) }}
      </span>
      <span class="game-card__status__text slide" v-if="game.status == 'ONGOING'">live</span>
      <span class="game-card__status__text" v-else>-</span>
      <span class="score" :class="{ winner: isWinner(game.opponent) && !isDraw }">
        {{ getScore(game.opponent) }}
      </span>
    </div>
    <div class="game-card__user opponent">
      <Avatar :user="game.opponent" :status="false" align="end" :popover="false" />
      <RouterLink
        :to="{ name: 'profile', params: { username: game.opponent.username } }"
        class="game-card__user__username hover:underline"
      >
        <span class="text-base max-w-[150px] truncate">{{ game.opponent.username }}</span>
      </RouterLink>
    </div>

    <div class="game-card__spectate" v-if="game.status == 'ONGOING'">
      <Spectate :game-id="game.id" :user-id="game.opponent.id" :is-game-card="true" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.game-card {
  @apply w-full bg-[#52545c95] px-3 py-2 rounded-sm hover:bg-[#4c4d5495] hover:text-gray-100 cursor-pointer relative;
  @apply grid grid-cols-[1fr,auto,1fr];
  @apply transition-colors duration-300;

  &:hover &__spectate {
    @apply opacity-100 z-10;
  }

  &__spectate {
    @apply absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2;
    @apply flex items-center justify-center bg-gray-500/50 opacity-0 -z-10 rounded-sm;
    @apply transition-opacity duration-300;
  }

  &__user {
    @apply flex justify-start items-center gap-2;

    &__avatar {
      @apply w-10 h-10 rounded-full;
    }
  }

  &__status {
    @apply flex items-center justify-center gap-5 text-gray-300;

    &__text {
      @apply text-sm relative text-slate-200 uppercase;

      &.slide:after {
        @apply absolute bottom-0 left-0 w-1.5 h-0.5 bg-teal-400 rounded-full;
        content: '';
        animation: 0.8s infinite ease-in-out alternate slide;
      }
    }

    .score {
      @apply bg-[#7376816c] px-2 py-0 rounded-sm;

      &.winner {
        @apply bg-teal-700;
      }
    }
  }
  &__user.opponent {
    @apply flex-row-reverse;
  }
}
</style>
