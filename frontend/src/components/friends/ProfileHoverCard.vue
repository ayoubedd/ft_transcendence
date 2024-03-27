<script lang="ts" setup>
import type { User } from '@/types/user.types'

const props = defineProps<{
  user?: User
  avatar?: string
  fallback?: string
  align?: 'start' | 'center' | 'end'
}>()

const _avatar = computed(() => {
  if (props.avatar) return props.avatar
  if (props.user?.id == useAuthStore().user?.id) return useAuthStore().user?.avatar
  return props.user?.avatar || ''
})
const _fallback =
  props.fallback || `https://ui-avatars.com/api/?name=${props.user?.username || 'user'}`

function setFallbackAvatar(e: Event) {
  const target = e.target as HTMLImageElement
  target.src = _fallback
}
</script>

<template>
  <HoverCard>
    <HoverCardTrigger as-child>
      <slot />
    </HoverCardTrigger>
    <HoverCardContent
      class="bg-background2 p-0 border-none w-[350px] h-80"
      :align="align || 'start'"
    >
      <div class="user-info">
        <div class="user-info__header">
          <img
            :src="_avatar"
            alt="Avatar"
            class="user-info__header__avatar"
            @error="setFallbackAvatar"
          />
          <div class="user-info__header__actions">
            <FriendGameSession :user="user" />
            <FriendDM :user="user" />
            <FriendAddRemove :user="user" variant="icon" />
            <Spectate :user-id="user?.id" variant="icon" v-if="user?.status == 'INGAME'" />
            <MoreActions :user="user" />
          </div>
        </div>

        <div class="user-info__info">
          <h3 class="user-info__info__name">
            <template v-if="user?.firstname && user?.lastname">
              <span>{{ user?.firstname }}</span>
              <span>{{ user?.lastname }}</span>
            </template>
            <span v-else>{{ user?.username }}</span>
          </h3>
          <span class="user-info__info__username">@{{ user?.username }}</span>
          <div class="user-info__info__bio">
            <span class="user-info__info__bio__title">About me</span>
            <p>
              {{ user?.bio }}
            </p>
          </div>
        </div>
      </div>
    </HoverCardContent>
  </HoverCard>
</template>

<style lang="scss">
.user-info {
  @apply flex flex-col rounded-sm bg-background2;

  &__header {
    @apply flex w-full h-[60px] bg-[#3868C7] rounded-t-sm relative;

    &__avatar {
      @apply w-[120px] h-[120px] rounded-full object-cover border-8 border-background2;
      @apply absolute bottom-[-70px] left-4;
    }

    &__actions {
      @apply flex items-center justify-center gap-1;
      @apply absolute bottom-[-40px] right-4;

      & > button {
        @apply flex gap-3 px-2 py-1 rounded-sm text-base font-medium;
        transition: opacity 0.25s ease-in-out;

        &:hover {
          opacity: 0.8;
        }
      }
    }
  }

  &__info {
    @apply flex flex-col gap-2 p-4 mt-20 mx-4 mb-8 bg-background rounded-sm text-gray-200;

    &__name {
      @apply text-xl font-semibold flex gap-2 items-center mb-[-8px];
    }

    &__username {
      @apply text-sm font-medium text-gray-500 max-w-[150px] truncate;
    }

    &__bio {
      @apply text-sm font-medium border-t-[1px] border-gray-600 pt-2;

      &__title {
        @apply text-base font-semibold uppercase text-gray-400;
      }

      & > p {
        @apply mt-2 max-h-[160px] overflow-y-auto pr-2 pb-2;
      }
    }
  }
}
</style>
