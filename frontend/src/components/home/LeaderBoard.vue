<script lang="ts" setup>
const { leaderboard } = storeToRefs(useUsersStore())

const novice = (level?: number) => level && level < 10
const raider = (level?: number) => level && level >= 10 && level < 30
const legend = (level?: number) => level && level >= 30
</script>

<template>
  <div class="leaderboard">
    <div class="leaderboard__title">
      <span class="text-gray-400">Leader board</span>
    </div>
    <div class="leaderboard__list">
      <div class="leaderboard__item" v-for="(leader, i) in leaderboard" :key="leader.id">
        <AvatartInfoItem :user="leader" :status="false" :subinfo="`Rank #${i + 1}`" size="lg" />

        <div class="leaderboard__item__stats">
          <AchievementCard type="novice" size="xs" v-if="novice(leader?.lp)" />
          <AchievementCard type="raider" size="xs" v-if="raider(leader?.lp)" />
          <AchievementCard type="legend" size="xs" v-if="legend(leader?.lp)" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Protest+Riot&display=swap');

.leaderboard {
  @apply flex flex-col gap-2;
  @apply pl-2 pr-1 py-1;

  &__title {
    @apply flex items-center justify-center gap-2 capitalize font-medium text-gray-300 text-3xl mt-2 mb-2;
    font-family: 'Protest Riot', sans-serif;
    background: -webkit-linear-gradient(315deg, #1c99ff 6%, #fb631d);
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  &__list {
    @apply flex flex-col gap-2 items-center;
  }

  &__item {
    @apply w-[650px] flex items-center gap-2 px-4 pr-6 py-2 rounded-sm cursor-pointer;
    @apply bg-[#1d1f25c7] hover:bg-[#26272dcf] hover:text-gray-100;
    @apply transition-colors duration-300;

    &__stats {
      @apply flex items-center gap-2 ml-auto mb-1;
    }
  }
}
</style>
