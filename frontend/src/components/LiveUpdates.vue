<script lang="ts" setup>
const { liveUpdates } = storeToRefs(useLiveUpdatesStore())
</script>

<template>
  <div class="live-updates">
    <div class="live-updates__title">
      <span class="text-gray-400">Live Updates</span>
    </div>
    <div class="live-updates__item" v-for="(update, i) in liveUpdates" :key="i">
      <Avatar :user="update.user" align="end" :popover="false" />
      <div class="live-updates__username">
        <span class="live-updates__username__name flex gap-2 items-center">
          <span class="max-w-[150px] truncate"> {{ update.user.username }}</span>
          <span class="live-updates__username__date">{{ update.date }}</span>
        </span>
        <span class="live-updates__username__status" :class="update.type">
          {{ update.message }}
        </span>
      </div>
    </div>

    <div class="flex items-center justify-center my-6" v-if="!liveUpdates.length">
      <span class="text-gray-400">It's quiet here...</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.live-updates {
  @apply flex flex-col gap-2 w-[340px];
  @apply pl-4 pr-1 pt-2 pb-10;

  &__title {
    @apply text-gray-300 text-lg pl-3 mt-2 font-medium uppercase text-sm text-gray-400 relative;

    &:after {
      @apply w-[60%] h-[1px] bg-gray-500 absolute top-1/2 left-[120px];
      content: '';
    }
  }

  &__item {
    @apply flex items-center gap-2 px-2 py-1 rounded-sm hover:bg-[#3e3f4595] hover:text-gray-100 cursor-pointer;
    @apply transition-colors duration-300;
  }

  &__username {
    @apply flex flex-col justify-center;

    &__name {
      @apply text-base;
    }

    &__date {
      @apply text-xs text-gray-500;
    }

    &__status {
      @apply text-xs text-gray-400 flex items-center gap-1 opacity-50;

      &.gameInvite {
        @apply text-blue-400;
        &__dot {
          @apply bg-blue-400;
        }
      }

      &.ingame {
        @apply text-blue-400;
        &__dot {
          @apply bg-blue-400;
        }
      }

      &.online {
        @apply text-green-500;
        &__dot {
          @apply bg-green-500;
        }
      }

      &.offline {
        @apply text-red-500;
        &__dot {
          @apply bg-red-500;
        }
      }
    }
  }
}
</style>
