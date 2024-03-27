<script lang="ts" setup>
import { Loader2 } from 'lucide-vue-next'

defineProps<{ loading?: boolean }>()
</script>

<template>
  <button class="base-btn" :class="{ loading }" :disabled="loading">
    <span v-if="loading" class="loader">
      <Loader2 class="animate-spin" />
    </span>
    <slot />
  </button>
</template>

<style lang="scss" scoped>
.base-btn {
  @apply flex items-center;
  @apply rounded-sm;
  @apply focus:outline-none;
  &.loading {
    @apply relative;

    .loader {
      @apply absolute inset-0 flex items-center justify-center w-full h-full bg-gray-500;
      border-radius: inherit;
      content: '';
    }
  }

  &:disabled {
    @apply bg-[#737373] text-gray-300 opacity-80 pointer-events-none;
  }
}

.btn-primary {
  @apply justify-center gap-2;
  @apply bg-primary;
  @apply focus:ring-2 focus:ring-blue-500;
  @apply px-2.5 py-1.5;
}
</style>
