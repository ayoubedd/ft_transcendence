<script lang="ts" setup>
import { Settings } from 'lucide-vue-next'

const { user } = storeToRefs(useAuthStore())
</script>

<template>
  <div class="profile-card">
    <Avatar :user="user" :popover="false" />
    <div class="profile-card__username">
      <span class="profile-card__username__name">{{ user.username }}</span>
      <span class="profile-card__username__status">{{ user.status || 'offline' }}</span>
    </div>
    <div class="profile-card__settings">
      <AccountSettings v-slot="{ openDialog }">
        <Button
          @click="openDialog"
          class="hover:bg-[#3e3f4595] w-[38px] h-[38px] rounded-sm flex items-center justify-center"
        >
          <Settings />
          <span class="visually-hidden">Settings</span>
        </Button>
      </AccountSettings>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.profile-card {
  @apply flex items-center px-2 pt-1 relative;

  &__username {
    @apply flex flex-col ml-3 justify-center pt-1 lowercase;

    &__name {
      @apply text-sm dark:text-gray-300 max-w-[150px] truncate;
    }

    &__status {
      @apply text-xs text-gray-400 capitalize;
    }
  }

  &__settings {
    @apply absolute h-full top-0.5 right-2 flex items-center;
  }
}
</style>
