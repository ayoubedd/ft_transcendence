<script lang="ts" setup>
defineProps<{
  type: 'novice' | 'raider' | 'legend'
  size?: 'sm' | 'md' | 'lg' | 'xs'
}>()
</script>

<template>
  <div class="achievement-card" :class="`w-${size} h-${size}`">
    <img :src="`/badges/${type}.png`" alt="achievement" class="image" />
    <span>{{ type }}</span>
  </div>
</template>

<style lang="scss" scoped>
.achievement-card {
  @apply flex items-center justify-center w-28 h-28 rounded-full bg-[#3e3f4595] relative;

  span {
    @apply absolute text-sm text-gray-300 -bottom-1 left-1/2 transform -translate-x-1/2 uppercase;
    @apply bg-[#73747b37] px-2 rounded-md;
  }

  &.w-sm {
    @apply w-16 h-16;
  }
  &.w-sm span {
    @apply text-xs;
  }

  &.w-xs {
    @apply w-12 h-12;
  }
  &.w-xs span {
    @apply text-xs;
  }

  &.w-md {
    @apply w-24 h-24;
  }
  &.w-md span {
    @apply text-sm;
  }

  &.w-lg {
    @apply w-32 h-32;
  }
  &.w-lg span {
    @apply text-sm;
  }
}
</style>
