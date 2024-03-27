<script lang="ts" setup>
import type { User } from '@/types/user.types'
import { getUsers } from '@/services/api/users'
import { debounce } from '@/utils'
import { Loader2 } from 'lucide-vue-next'

const foundFriends = ref<User[]>([])
const searchQuery = ref('')
const loading = ref(false)
const showMenu = ref(false)
const searchMenu = ref<HTMLElement | null>(null)

async function searchFriends() {
  loading.value = true
  if (searchQuery.value.length > 0) {
    const response = await getUsers({ username: searchQuery.value, limit: 10, offset: 1 })
    foundFriends.value = response.data
  } else {
    foundFriends.value = []
  }
  loading.value = false
}

const debouncedSearchFriends = debounce(searchFriends, 1000, false)

function closeOnOutsideClick(event: MouseEvent) {
  if (searchMenu.value && !searchMenu.value.contains(event.target as Node)) {
    showMenu.value = false
  }
}

onMounted(() => {
  window.addEventListener('click', closeOnOutsideClick)
})

onUnmounted(() => {
  window.removeEventListener('click', closeOnOutsideClick)
})
</script>

<template>
  <div class="friends-search" ref="searchMenu">
    <input
      v-model="searchQuery"
      @input="debouncedSearchFriends"
      @focus="showMenu = true"
      class="friends-search__input"
      type="text"
      placeholder="Find your friend"
    />

    <div v-if="showMenu" class="friends-search__menu">
      <div v-if="foundFriends.length > 0" class="friends-list">
        <UserItem v-for="friend in foundFriends" :key="friend.id" :user="friend" />
      </div>

      <div v-else-if="loading" class="loader">
        <Loader2 class="animate-spin" />
      </div>

      <div v-else class="no-friends">No friends found</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.friends-search {
  @apply flex items-center px-2 py-2.5 w-full h-full relative;

  &__input {
    @apply w-full h-full px-2 pb-0.5 rounded-sm bg-background2 text-gray-400 text-sm outline-none cursor-pointer;
    @apply placeholder:text-gray-400 placeholder:text-xs;
  }

  &__menu {
    @apply absolute top-11 left-1/2 -translate-x-1/2 w-[94%] h-[400px] overflow-y-auto;
    @apply bg-background2 rounded-sm shadow-lg;
    @apply z-10;

    .friends-list {
      @apply flex flex-col gap-2;
      @apply pl-2 pr-1 py-1;
    }

    .loader {
      @apply text-gray-400 flex w-full h-full items-center justify-center;
    }

    .no-friends {
      @apply text-gray-400 text-sm flex w-full h-full items-center justify-center;
    }
  }
}
</style>
