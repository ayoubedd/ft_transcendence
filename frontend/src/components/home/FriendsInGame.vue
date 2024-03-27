<script lang="ts" setup>
const { friendsInGame } = storeToRefs(useFriendStore())
const { fetchFriendsInGame } = useFriendStore()

async function _fetchFriendsInGame($state: any) {
  try {
    const res = await fetchFriendsInGame({
      userId: useAuthStore().user.id,
      offset: friendsInGame.value.length,
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
  <div class="friends-in-game">
    <div class="friends-in-game__title">Friends in game</div>
    <div class="friends-in-game__list">
      <UserItem v-for="friend in friendsInGame" :key="friend.id" :user="friend" :status="true" />

      <InfiniteLoading @infinite="_fetchFriendsInGame" :slots="{ complete: ' ' }">
        <template #complete>
          <div
            class="flex items-center justify-center text-gray-400 text-sm font-medium"
            v-if="!friendsInGame.length"
          >
            No friends in game
          </div>
        </template>
      </InfiniteLoading>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.friends-in-game {
  @apply flex flex-col gap-4 py-4 w-full;

  &__title {
    @apply pl-3 font-medium uppercase text-sm text-gray-400 relative;

    &:after {
      @apply w-[100%] h-[1px] bg-gray-500 absolute top-1/2 left-[140px];
      content: '';
    }
  }

  &__list {
    @apply flex flex-col gap-3 px-2;
  }

  &__item {
    @apply flex items-center justify-between py-[2px] px-2 cursor-pointer relative;
    transition: background-color 0.2s ease-in-out;

    &:after {
      content: '';
      @apply absolute w-full h-[1px] bottom-[-6px] left-0 bg-gray-600;

      &:last-child {
        @apply hidden;
      }
    }

    &:hover {
      @apply rounded-sm;
      background-color: rgba(85, 85, 85, 0.435);
    }

    &__user {
      @apply flex flex-col items-center;

      &__avatar {
        @apply w-8 h-8 rounded-full border-2 border-blue-950;
      }

      &__username {
        @apply text-gray-300 text-sm font-medium max-w-[76px] truncate;
      }
    }

    &__vs {
      @apply flex items-center justify-center gap-1 text-gray-300 text-sm font-medium relative;
      @apply w-12 h-12 rounded-full overflow-hidden;

      span {
        @apply absolute bottom-[2px] right-[8px] text-base font-bold text-primary;

        &:first-child {
          @apply top-[2px] left-[8px];
        }
      }

      &:after {
        @apply absolute w-[18px] h-[1px] bg-[#e8ba3a] -rotate-45 top-3 -right-0;
        content: '';
      }

      &:before {
        @apply absolute w-[18px] h-[1px] bg-[#e8ba3a] -rotate-45 bottom-3 -left-0;
        content: '';
      }

      svg {
        @apply w-4 h-4 fill-[#e8ba3a];
        // animation: pulse 1s infinite;
      }
    }
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.1);
  }

  100% {
    transform: scale(1);
  }
}
</style>
