<script lang="ts" setup></script>

<template>
  <div class="game-loss">
    <h1>Defeat!</h1>
    <p>You have lost the game!</p>
  </div>
</template>

<style lang="scss" scoped>
.game-loss {
  @apply h-full w-full flex flex-col items-center justify-center relative py-12 gap-6;

  h1 {
    @apply text-8xl font-semibold text-gray-100;
  }

  p {
    @apply text-2xl font-medium text-gray-200;
  }
}
</style>
