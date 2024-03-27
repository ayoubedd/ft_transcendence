<script lang="ts" setup>
const { getLeaderboard } = useUsersStore()

onMounted(async () => {
  await getLeaderboard(100, 0)
})
</script>

<template>
  <div class="home-view">
    <div class="home-view__bg">
      <img src="@/assets/images/pong-player.png" alt="ping pong" />
    </div>
    <div class="home-view__content">
      <LeaderBoard />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.home-view {
  @apply flex flex-col gap-2 relative h-full overflow-y-auto;

  &__bg {
    @apply flex justify-center w-full h-full absolute top-0 left-0 z-0 opacity-30;
    filter: blur(5px);

    & > img {
      @apply h-full w-full object-cover;
    }
  }

  &__content {
    @apply flex flex-col gap-2 z-10 h-full overflow-y-auto pb-6;
    @apply px-4 py-2;
  }
}
</style>
