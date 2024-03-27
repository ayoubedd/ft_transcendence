<script lang="ts" setup>
import type { Friend } from '@/types/friend.types'
import type { User } from '@/types/user.types'

const props = withDefaults(
  defineProps<{
    user: User | Friend
    status?: boolean
    popover?: boolean
    subinfo?: string
    size?: 'md' | 'lg' | 'xl'
    align?: 'start' | 'center' | 'end'
  }>(),
  {
    status: true,
    popover: true,
    subinfo: ''
  }
)

const _user = computed(() => {
  if (props.user?.id == useAuthStore().user?.id) return useAuthStore().user
  return props.user
})
</script>

<template>
  <div class="profile-item">
    <Avatar :user="_user" :popover="popover" :status="status" :align="align" :size="size" />
    <div class="profile-item__info">
      <RouterLink
        :to="{ name: 'profile', params: { username: _user.username } }"
        class="profile-item__info__name"
      >
        <span>{{ _user.username }}</span>
      </RouterLink>
      <span class="profile-item__info__subinfo" v-if="subinfo">
        {{ subinfo }}
      </span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.profile-item {
  @apply flex items-center gap-2 px-2 py-1.5 rounded-sm w-full;

  &__info {
    @apply flex flex-col justify-center w-full;

    &__name {
      @apply text-base w-fit max-w-[250px] truncate hover:underline;
    }

    &__subinfo {
      @apply text-xs text-gray-400 opacity-60 ml-[2px];
    }
  }
}
</style>
