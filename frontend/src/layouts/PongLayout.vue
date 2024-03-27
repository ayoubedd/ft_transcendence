<template>
  <div class="game-layout text-slate-200">
    <SideNav class="nav bg-background2" />

    <main class="dark bg-background">
      <slot> </slot>
    </main>
  </div>
</template>

<style scoped lang="scss">
.game-layout {
  @apply w-full h-full bg-background text-gray-400 text-lg font-medium;
  display: grid;
  grid-template-columns: auto 1fr;

  .nav {
    width: 72px;
  }
}
</style>
