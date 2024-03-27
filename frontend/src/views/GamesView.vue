<script lang="ts" setup>
const { filteredGames, games } = storeToRefs(useGameStore())

let firstload = true
async function _fetchGames($state: any) {
  if (firstload) {
    useGameStore().$reset()
    firstload = false
  }

  try {
    const res = await useGameStore().fetchGames({
      userId: useAuthStore().user.id,
      offset: games.value.length,
      limit: 10
    })
    if (res?.length) $state.loaded()
    else $state.complete()
  } catch (error) {
    $state.error()
  }
}
</script>

<template>
  <div class="games-view">
    <div class="games-view__history">
      <GameCard v-for="game in filteredGames" :key="game.id" :game="game" />

      <InfiniteLoading @infinite="_fetchGames">
        <template #complete>
          <div class="text-gray-400 text-center">
            <span v-if="!filteredGames.length">No games found</span>
          </div>
        </template>
      </InfiniteLoading>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.games-view {
  @apply px-4 py-10 h-full overflow-y-auto;

  &__history {
    @apply w-full flex flex-col gap-4 max-w-[800px] mx-auto;
  }
}
</style>
