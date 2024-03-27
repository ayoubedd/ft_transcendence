<script lang="ts" setup>
import { Users } from 'lucide-vue-next'
import type { Status } from '@/stores/friends'

const { activeStatus } = storeToRefs(useFriendStore())
const { setStatus, requestFriendByUsername } = useFriendStore()

const toast = useToast()
const username = ref('')
const statuses: Status[] = ['all', 'online', 'ingame', 'pending', 'blocked']
const loading = ref(false)

async function sendFriendRequest() {
  if (!username.value) return
  try {
    loading.value = true
    await requestFriendByUsername({ username: username.value })
    username.value = ''
    loading.value = false
    toast.success('Friend request sent')
  } catch (error: any) {
    toast.error(error?.message)
    loading.value = false
  }
}
</script>

<template>
  <div class="friends-navbar">
    <RouterLink :to="{ name: 'friends' }" class="friends-navbar__link">
      <Users class="friends-navbar__icon" />
      <span>friends</span>
    </RouterLink>
    <div class="divider"></div>
    <div class="friends-navbar__actions">
      <Button
        class="friends-navbar__actions__btn"
        :class="{ active: status === activeStatus }"
        v-for="status in statuses"
        :key="status"
        @click="setStatus(status)"
      >
        {{ status }}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button class="friends-navbar__actions__btn add">add friend</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="bottom"
          align="start"
          class="bg-background2 border-none px-4 py-6 flex flex-col gap-1 w-80"
        >
          <input class="w-full input-primary" placeholder="username" v-model="username" />

          <Button class="btn btn-primary mt-2" @click="sendFriendRequest" :loading="loading">
            Send Request
          </Button>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.friends-navbar {
  @apply h-full flex items-center px-4;

  &__link {
    @apply flex items-center gap-2.5 capitalize font-medium text-gray-100 text-base;
  }

  &__icon {
    @apply w-[22px] mb-1 stroke-gray-400;
  }

  .divider {
    @apply h-6 w-px bg-gray-700 mx-4;
  }

  &__actions {
    @apply flex items-center gap-2 text-gray-400;

    &__btn {
      @apply px-2.5 py-[1px] rounded-sm hover:bg-[#73737334] hover:text-gray-300 capitalize font-medium text-base;

      &.active {
        @apply bg-[#73737334] text-gray-100;
      }

      &.add {
        @apply bg-[#2c7d43] hover:bg-[#2c7d43] text-gray-100;
      }
    }
  }
}
</style>
