<script lang="ts" setup>
import type { ChatMember } from '@/types/chat.types'
import { getChannelMembers } from '@/services/api/channels'
import { debounce } from '@/utils'
import { Loader2 } from 'lucide-vue-next'

const { activeChat } = storeToRefs(useChatStore())
const itemsFound = ref<ChatMember[]>([])
const searchQuery = ref('')
const loading = ref(false)
const showMenu = ref(false)
const searchMenu = ref<HTMLElement | null>(null)

async function searchFriends() {
  if (!searchQuery.value.length) return (itemsFound.value = [])
  loading.value = true
  const { data, error } = await getChannelMembers(activeChat.value?.chat?.id || '')

  if (error) {
    console.error(error)
    return
  }

  itemsFound.value = data.filter((member: ChatMember) =>
    member.user.username.toLowerCase().startsWith(searchQuery.value.toLowerCase())
  )

  loading.value = false
}

const debouncedSearch = debounce(searchFriends, 500, false)

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
  <div class="search" ref="searchMenu">
    <input
      v-model="searchQuery"
      @input="debouncedSearch"
      @focusin="showMenu = true"
      class="search__input"
      type="text"
      placeholder="Find member"
    />

    <div v-if="showMenu" class="search__menu">
      <div v-if="itemsFound.length" class="results">
        <ChatMember v-for="member in itemsFound" :key="member.user.username" :member="member" />
      </div>

      <div v-else-if="loading" class="loader">
        <Loader2 class="animate-spin" />
      </div>

      <div v-else class="no-friends">No items found</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.search {
  @apply flex items-center px-2 py-2.5 w-80 h-full relative;

  &__input {
    @apply border-none text-gray-300 bg-background2 px-2 py-1 rounded-sm w-full outline-none placeholder:text-sm text-sm;
  }

  &__menu {
    @apply absolute top-11 left-1/2 -translate-x-1/2 w-[95%] h-[400px] overflow-y-auto;
    @apply bg-background2 rounded-sm shadow-lg;
    @apply z-10;

    .results {
      @apply flex flex-col gap-2;
      @apply px-1 py-2;
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
