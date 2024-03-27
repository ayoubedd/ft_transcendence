<script lang="ts" setup>
import { Home } from 'lucide-vue-next'
</script>

<template>
  <div class="home-navbar">
    <RouterLink to="/" class="home-navbar__link">
      <Home class="home-navbar__icon" />
      <span>Home</span>
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
