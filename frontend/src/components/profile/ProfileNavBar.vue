<script lang="ts" setup>
import { User } from 'lucide-vue-next'

const { activeProfile } = storeToRefs(useProfileStore())

const getUsername = computed(() => {
  if (activeProfile.value?.user.id == useAuthStore().user?.id) return 'Your'
  return `${activeProfile.value?.user.username}'s`
})
</script>

<template>
  <div class="home-navbar">
    <RouterLink :to="{ name: 'profile' }" class="home-navbar__link">
      <User class="home-navbar__icon" />
      <span class="max-w-[150px] truncate">{{ getUsername }}</span>
      <span>Profile</span>
    </RouterLink>
  </div>
</template>

<style lang="scss" scoped>
.home-navbar {
  @apply h-full flex items-center px-4;

  &__link {
    @apply flex items-center gap-2 capitalize font-medium text-gray-300;
  }

  &__icon {
    @apply w-[22px] mb-1 stroke-gray-400;
  }
}
</style>
