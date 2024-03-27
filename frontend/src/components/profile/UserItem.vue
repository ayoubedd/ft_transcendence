<script lang="ts" setup>
import type { Friend } from '@/types/friend.types'
import type { User } from '@/types/user.types'
import { ArrowRight } from 'lucide-vue-next'

const props = defineProps<{
  user: User | Friend
  status?: boolean
}>()

const _user = computed(() => {
  if (props.user?.id == useAuthStore().user?.id) return useAuthStore().user
  return props.user
})
</script>

<template>
  <RouterLink
    class="user-item"
    :to="{
      name: 'profile',
      params: { username: _user.username }
    }"
  >
    <Avatar :user="_user" :status="status" class="bg-green-100" />
    <div class="user-item__username">
      <span class="user-item__username__name">{{ _user.username }}</span>
    </div>

    <ArrowRight
      class="arrow-right stroke-gray-100 transition-all duration-300 ml-auto pr-1 opacity-0"
    />
  </RouterLink>
</template>

<style lang="scss" scoped>
.user-item {
  @apply flex items-center gap-2 px-2 py-1 rounded-sm hover:bg-[#3e3f4595] hover:text-gray-100 cursor-pointer;
  @apply transition-colors duration-300;

  &:hover {
    .arrow-right {
      @apply opacity-100 transform translate-x-1;
    }
  }

  &__username {
    @apply flex flex-col justify-center max-w-[150px] truncate;

    &__name {
      @apply text-base truncate;
    }
  }
}
</style>
