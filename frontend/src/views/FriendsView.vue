<script lang="ts" setup>
import type { User } from '@/types/user.types'
import { MessageCircle } from 'lucide-vue-next'

const { filteredFriends } = storeToRefs(useFriendStore())

const { fetchFriends, fetchFriendRequests, fetchFriendBlocks } = useFriendStore()

const isFriend = (user: User) => {
  return user.friendship?.status === 'ACCEPTED'
}

onMounted(async () => {
  await fetchFriends({
    limit: 300,
    userId: useAuthStore().user?.id,
    offset: 0
  })
  await fetchFriendRequests()
  await fetchFriendBlocks()
})
</script>

<template>
  <div class="friends-view">
    <div class="friends-view__list">
      <div class="friends-view__list__item" v-for="friend in filteredFriends" :key="friend.id">
        <AvatartInfoItem
          :user="friend"
          size="md"
          :subinfo="isFriend(friend) ? friend.status : ''"
        />

        <div class="friends-view__list__item__actions">
          <FriendAccept :user="friend" />
          <FriendDM
            :user="friend"
            v-slot="{ createChannel, loading }"
            v-if="friend.friendship?.status == 'ACCEPTED'"
          >
            <Button
              class="friends-view__list__item__actions__btn"
              :loading="loading"
              @click="createChannel"
            >
              <span class="visually-hidden">Message</span>
              <MessageCircle class="friends-view__list__item__actions__btn__icon" />
            </Button>
          </FriendDM>
          <FriendReject :user="friend" />
          <FriendBlockUnblock :user="friend" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.friends-view {
  @apply h-full flex flex-col gap-4;
  @apply px-4 py-2;

  &__list {
    @apply flex flex-col py-4;
  }

  &__list__item {
    @apply flex items-center gap-3;
    @apply cursor-pointer;
    @apply hover:bg-[#6a6a6a34] rounded-sm;
    @apply px-4 py-2;
    @apply border-t-[1px] border-[#6a6a6a34];

    &:hover &__actions {
      @apply opacity-100;
    }

    &:first-child {
      @apply border-t-0;
    }

    &__info {
      @apply flex flex-col;

      &__username {
        @apply text-gray-200 font-medium text-base;
      }

      &__status {
        @apply text-gray-400 font-medium text-sm capitalize;
      }
    }

    &__actions {
      @apply ml-auto flex items-center gap-3.5 opacity-0 transition-opacity duration-200;

      &__btn {
        @apply flex items-center justify-center rounded-full w-[45px] h-[45px];
        @apply text-gray-400 bg-[#383A40] hover:text-gray-100 hover:bg-[#73737334];

        &.block svg {
          @apply stroke-[#fd5454];
        }
      }
    }
  }
}
</style>
