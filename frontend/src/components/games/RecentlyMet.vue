<script lang="ts" setup>
const { recentlyMet } = storeToRefs(useGameStore())
const { fetchRecentlyMet } = useGameStore()

let firstload = true
async function _fetchRecentlyMet($state: any) {
  if (firstload) {
    recentlyMet.value = []
    firstload = false
  }

  try {
    const res = await fetchRecentlyMet({
      userId: useAuthStore().user.id,
      offset: recentlyMet.value.length,
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
  <div class="recent-players">
    <div class="recent-players__title">
      <span class="text-gray-400">Recently Met</span>
    </div>
    <UserItem v-for="user in recentlyMet" :key="user.id" :user="user" />

    <InfiniteLoading @infinite="_fetchRecentlyMet">
      <template #complete>
        <div class="text-gray-400 text-center">
          <span v-if="!recentlyMet.length">No players met yet</span>
        </div>
      </template>
    </InfiniteLoading>
  </div>
</template>

<style lang="scss" scoped>
.recent-players {
  @apply flex flex-col gap-2;
  @apply pl-2 pr-1 py-1;

  &__title {
    @apply pl-2 mt-2 font-medium uppercase text-sm text-gray-400 relative;
  }

  &__item {
    @apply flex items-center gap-2 px-2 py-1 rounded-s cursor-pointer hover:bg-[#3e3f4595] hover:text-gray-100;
    @apply transition-colors duration-300;

    &:hover .recent-players__actions {
      @apply opacity-100;
    }
  }

  &__username {
    @apply flex flex-col justify-center capitalize;

    &__name {
      @apply text-base;
    }
  }

  &__actions {
    @apply flex flex-col justify-center ml-auto gap-2 opacity-0;
    @apply transition-opacity duration-200;

    &__btn {
      @apply flex items-center justify-center rounded-sm w-[40px] h-[28px];
      @apply bg-[#379753] text-gray-300 text-[11px] hover:bg-[#2c7d43] hover:text-gray-100;
      @apply transition-colors duration-300;

      &__icon {
        @apply w-[24px] stroke-gray-300;
      }
    }
  }
}
</style>
