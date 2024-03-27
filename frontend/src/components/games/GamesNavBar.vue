<script lang="ts" setup>
import type { GameFilter } from '@/types/game.types'
import { Gamepad2 } from 'lucide-vue-next'

const gameFilters: GameFilter[] = ['all', 'ongoing', 'victory', 'defeat', 'draw']

const { activeFilter } = storeToRefs(useGameStore())
const { setGameFilter } = useGameStore()
</script>

<template>
  <div class="games-navbar">
    <RouterLink :to="{ name: 'games' }" class="games-navbar__link">
      <Gamepad2 class="games-navbar__icon" />
      <span>Games</span>
    </RouterLink>
    <div class="divider"></div>
    <div class="games-navbar__actions">
      <Button
        class="games-navbar__actions__btn"
        :class="{ active: filter === activeFilter }"
        v-for="filter in gameFilters"
        :key="filter"
        @click="setGameFilter(filter)"
      >
        {{ filter }}
      </Button>

      <span class="divider"></span>

      <Button
        class="games-navbar__actions__btn"
        :class="{ active: 'live' === activeFilter }"
        @click="setGameFilter('live')"
      >
        Live Games
      </Button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.games-navbar {
  @apply h-full flex items-center px-4;

  &__link {
    @apply flex items-center gap-2.5 capitalize font-medium text-gray-100 text-base;
  }

  &__icon {
    @apply w-[22px] stroke-gray-400;
  }

  .divider {
    @apply h-6 w-px bg-gray-700 mx-4;
  }

  &__actions {
    @apply flex items-center gap-2 text-gray-400;

    &__btn {
      @apply px-2.5 py-[1px] rounded-sm hover:bg-[#73737334] hover:text-gray-300 capitalize font-medium text-base;

      &.active {
        @apply bg-[#73737334] text-gray-100;
      }

      &.add {
        @apply bg-[#2c7d43] hover:bg-[#2c7d43] text-gray-100;
      }
    }
  }
}
</style>
